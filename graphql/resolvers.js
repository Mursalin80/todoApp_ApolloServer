const Books = require('../models/Books');
const User = require('../models/user');
const Todo = require('../models/todo');

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
    addUser: async (_, { input }, ctx) => {
      let { name, email, DOB, state } = input;

      const user = new User({ name, email, DOB, state });

      await user.save();

      return {
        id: user._id,
        ...user._doc,
      };
    },

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
  },
};

module.exports = resolvers;
