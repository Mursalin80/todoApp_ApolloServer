const {
  UserInputError,
  AuthenticationError,
} = require('apollo-server-express');
const { asyncErrors, asyncHandler } = require('../utils/async_error');
const bcrypt = require('bcryptjs');

const Books = require('../models/Books');
const User = require('../models/user');
const Todo = require('../models/todo');
const { jwtSign, jwtVerify } = require('../utils/jwt');

// const asyError = require('../utils/async_error');

const resolvers = {
  Query: {
    books: () => Books,
    todos: async () => {
      let todos = await Todo.find({}).populate('auther').exec();

      console.log(todos);

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
  },

  Mutation: {
    // Add a User
    addUser: async (_, { input }, ctx) => {
      let { name, email, DOB, state, password } = input;

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

    //  Add Todo
    addTodo: async (_, { input }, { token }) => {
      let auther = jwtVerify(token);
      let { title, description } = input;
      const todo = new Todo({ title, description, auther });
      await todo.save();

      let user = await User.findById(auther);
      user.todos.push(todo);
      await user.save();
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
};

module.exports = resolvers;
