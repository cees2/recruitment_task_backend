const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const createTokenAndSendResponse = (
  response,
  statusCode,
  user,
  message = ''
) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;

  const jsonToBeSent = {
    status: 'success',
    message,
    token,
    data: {
      user,
    },
  };

  if (!message) delete jsonToBeSent.message;

  // response.removeHeader('Access-Control-Allow-Origin');

  // const cookieOptions = {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  //   ),
  // };

  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // response.cookie('jwt', token, cookieOptions);

  response.status(statusCode).json(jsonToBeSent);
};

exports.signup = catchAsync(async (request, response, next) => {
  const { body } = request;

  const addedUser = await User.create({
    name: body.name,
    email: body.email,
    password: body.password,
    passwordConfirm: body.passwordConfirm,
  });

  createTokenAndSendResponse(
    response,
    201,
    addedUser,
    'User has been successfuly registered.'
  );
});

exports.login = catchAsync(async (request, response, next) => {
  const { email, password } = request.body;
  // 1) Check if email and password are included in request body:

  if (!email)
    return next(new AppError('Missing email. Enter it and try again', 400));
  if (!password)
    return next(new AppError('Missing password. Enter it and try again', 400));

  // 2) Get user and check password

  console.log(email);

  const user = await User.findOne({ email }).select('+password');

  // User does not exist in DB or password is incorrect
  if (!user || !(await user.checkIfPasswordIsCorrect(password)))
    return next(new AppError('Incorrect email or password', 401));

  // If compilator reached this point --> user inputed correct data
  createTokenAndSendResponse(
    response,
    200,
    user,
    'User has been correctly logged in.'
  );
});

// The following function checks if user is logged in with a valid token.
exports.protect = catchAsync(async (request, response, next) => {
  // 1) Get token
  const { authorization } = request.headers;
  const token = authorization.split(' ')[1];

  // if (!token) return next(new AppError('You are not logged in.', 401));

  // 2) Token verification. We have to promisify it, because decoding can take some time
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  // 3) Check if user still exists:
  const user = await User.findById(decodedToken.id);

  if (!user) next(new AppError('This user no loger exist', 401));

  // 4) Check if user has changed password since JWT was issued

  // if (await user.passwordChangedAfterJWTWasIssued(decodedToken.iat))
  //   return next(
  //     new AppError('User has recently changed password. Log in and try again')
  //   );

  // if compiler reached this point --> user is logged in.
  // Next middleware functions fill have access to currently logged in user.
  request.user = user;
  next();
});

exports.restrictTo =
  (...authorizedRoles) =>
  (request, response, next) => {
    const { role } = request.user;

    if (!authorizedRoles.includes(role))
      return next(
        new AppError('You do not have permission to perform this aciton')
      );

    // user is authorized and have access to protected actions.
    next();
  };
