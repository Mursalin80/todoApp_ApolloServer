const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const userSchems = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    state: String,
    DOB: String,
    todos: [{ type: Schema.Types.ObjectId, ref: 'Todo' }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchems);
