const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const userSchems = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    state: String,
    DOB: String,
    todos: [{ type: Schema.Types.ObjectId, ref: 'Todo' }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchems);
