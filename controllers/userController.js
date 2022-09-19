const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createUser = catchAsync(async (request, response, next) => {
  const { body } = request;

  const user = await User.create({
    name: body.name,
    email: body.email,
    password: body.password,
    passwordConfirm: body.passwordConfirm,
  });

  if (!user)
    return response.status(400).json({
      status: 'error',
      message: 'An error ocurred',
    });

  response.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
