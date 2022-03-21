const {
  UserInputError,
  AuthenticationError,
} = require('apollo-server-express');
const bcrypt = require('bcryptjs');
const { PubSub } = require('graphql-subscriptions');
const sgMail = require('@sendgrid/mail');
const { GraphQLUpload } = require('graphql-upload');
const crypto = require('crypto');

const Books = require('../models/Books');
const User = require('../models/user');
const Todo = require('../models/todo');
const { jwtSign, jwtVerify } = require('../utils/jwt');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const pubsub = new PubSub();

const resolvers = {
  Upload: GraphQLUpload,
  Query: {
    books: () => Books,
    todos: async () => {
      let todos = await Todo.find({}).populate('auther').exec();

      return [...todos];
    },
    me: async (_, arg, { token }) => {
      let id = jwtVerify(token);

      let user = await User.findById(id).select('name email state');

      if (!user) {
        throw new AuthenticationError('Wrong Token provided.');
      }
      return {
        id: id,
        ...user._doc,
      };
    },

    // // Rest API Users
    restUsers: (_, arg, { dataSources }) => {
      return dataSources.typecodeApi.getUsers();
    },

    // Rest API User
    restUser: (_, { id }, { dataSources }) => {
      return dataSources.typecodeApi.getUser(id);
    },

    // Rest User Password
    forgetPassword: async (_, { email }, { req }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new UserInputError('Invalid email');
      }
      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      // Create reset password url
      // const resetUrl = `${req.protocol}://${req.get('host')}/password/reset/${resetToken}`;

      const msg = {
        to: email, // Change to your recipient
        from: process.env.SENDGRID_FROM_EMAIL, // Change to your verified sender
        subject: 'Password Reset URL',
        text: 'Your Token to reset your password.',
        html: `<strong>${resetToken}</strong>`,
      };
      sgMail.send(msg).catch((error) => {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.save();
        console.error(error);
      });

      return { email };
    },
  },

  Mutation: {
    // Add a User
    addUser: async (_, { input }, ctx) => {
      let { name, email, DOB, state, password } = input;
      // const { createReadStream, filename, mimetype, encoding } = await file;
      // console.log({ filename, mimetype });
      let exUser = await User.findOne({ email });
      if (exUser) {
        throw new UserInputError('User already Exist!', {
          argumentName: email,
        });
      }

      let hashPassword = await bcrypt.hash(password, 10);

      const user = new User({
        name,
        email,
        DOB,
        state,
        password: hashPassword,
      });

      await user.save();
      let token = jwtSign(user._id);

      return {
        id: user._id,
        ...user._doc,
        token,
      };
    },

    // Login User
    login: async (_, { input }) => {
      let { password, email } = input;
      let user = await User.findOne({ email });

      if (!user) {
        throw new UserInputError('Invalid email or password!');
      }
      let hash = await bcrypt.compare(password, user.password);
      if (!hash) {
        throw new UserInputError('Invalid email or password!!');
      }

      let token = jwtSign(user._id);

      return {
        token,
      };
    },

    // Reset User Password
    resetPassword: async (_, { input: { token, password } }, ctx) => {
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        throw new UserInputError('Invalid or Expaired token.');
      }
      if (!password) {
        throw new UserInputError('Password is required.');
      }
      let hashPassword = await bcrypt.hash(password, 10);
      let jwtToken = jwtSign(user._id);
      user.password = hashPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return {
        id: user._id,
        ...user._doc,
        token: jwtToken,
      };
    },

    //  Add Todo
    addTodo: async (_, { input }, { token }) => {
      let auther = jwtVerify(token);
      let { title, description } = input;
      const todo = new Todo({ title, description, auther });
      await todo.save();

      let user = await User.findById(auther);
      user.todos.push(todo);
      await user.save();

      pubsub.publish('new_todo', {
        todoCreated: {
          id: todo._id,
          ...todo._doc,
        },
      });

      return {
        id: todo._id,
        ...todo._doc,
      };
    },

    // Delete Todo
    deleteTodo: async (_, { id }, { token }) => {
      let auther = jwtVerify(token);

      let todo = await Todo.findByIdAndDelete(id);

      let user = await User.findById(auther);
      //Email

      let toEmail = user.email;

      const msg = {
        to: toEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `${todo._id} todo By ${user.name} has been deleted`,
        text: `${todo.title} todo By ${user.name} has been deleted`,
        html: `<pre>
        <h2>Todo Title: <h2/>${todo.title} <br/>
        <h2>Todo Description: <h2/>${todo.description}
        is Deleted!
        </pre>`,
      };

      (async () => {
        try {
          await sgMail.send(msg);
        } catch (error) {
          console.error(error);

          if (error.response) {
            console.error(error.response.body);
          }
        }
      })();

      user.todos.pull(todo);
      await user.save();
      return {
        id: todo._id,
        ...todo._doc,
      };
    },

    // update Todo
    updateTodo: async (_, { id, input }, { token }) => {
      let auther = jwtVerify(token);

      let todo = await Todo.findByIdAndUpdate(id, { ...input });
      return {
        id,
        ...todo._doc,
      };
    },
  },

  Subscription: {
    todoCreated: {
      // subscribe: () => pubSup.asyncIterator(['todo_created']),
      subscribe: () => pubsub.asyncIterator(['new_todo']),
    },
  },
};

module.exports = resolvers;
