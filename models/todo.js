const mongoose = require('mongoose');

const todoSchems = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    auther: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  }
);

const Todo = mongoose.model('Todo', todoSchems);

module.exports = Todo;
