const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const crypto = require('crypto');

const userSchems = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minlength: [6, 'Your password must be longer than 6 characters'],
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    state: String,
    DOB: String,
    todos: [{ type: Schema.Types.ObjectId, ref: 'Todo' }],
  },
  {
    timestamps: true,
  }
);

userSchems.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expire time
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchems);
