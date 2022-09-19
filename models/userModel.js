const validator = require('validator');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Provide email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a correct email'],
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minLength: 8,
    select: false,
  },
  // ========== Works only with save() method ==============
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    minLength: 8,
    validate: {
      validator: function (passwordConfirm) {
        return passwordConfirm === this.password;
      },
      message: 'Provided passwords are different.',
    },
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin'],
  },
  passwordChangedAt: Date,
  passwordResetExpires: Date,
  passwordResetToken: String,
});

// create method invokes save method
userSchema.pre('save', async function (next) {
  // checking if password is not modified
  if (this.isModified('password')) {
    // hashing password before saving to DB,
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.methods.checkIfPasswordIsCorrect = async function (
  passwordFromUser
) {
  return await bcrypt.compare(passwordFromUser, this.password);
};

userSchema.methods.passwordChangedAfterJWTWasIssued = async function (
  JWTIssueDate
) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTIssueDate < changedAt;
  }
  // Password has not been changed
  return false;
};

const User = model('User', userSchema);

module.exports = User;
