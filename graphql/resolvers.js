const { UserInputError } = require('apollo-server');
const { asyncErrors, asyncHandler } = require('../utils/async_error');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Books = require('../models/Books');
const User = require('../models/user');
const Todo = require('../models/todo');
// const asyError = require('../utils/async_error');

const resolvers = {
  Query: {
    books: () => Books,
    todos: async () => {
      let todos = await Todo.find({}).populate('auther').exec();

      console.log(todos);

      return [...todos];
    },
  },

  Mutation: {
    addUser: asyncErrors(async (_, { input }, ctx) => {
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
      let token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      return {
        id: user._id,
        ...user._doc,
        token,
      };
    }),

    addTodo: async (_, { input }, ctx) => {
      let { title, description, auther } = input;
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

    login: asyncHandler(async (_, { input }, ctx) => {
      let { password, email } = input;
      let user = await User.findOne({ email });
      console.log(ctx);
      if (!user) {
        throw new UserInputError('Invalid email or password!');
      }
      let hash = await bcrypt.compare(password, user.password);
      if (!hash) {
        throw new UserInputError('Invalid email or password!!');
      }

      let token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      return {
        token,
      };
    }),
  },
};

module.exports = resolvers;
