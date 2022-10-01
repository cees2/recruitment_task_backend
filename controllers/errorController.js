const AppError = require('../utils/appError');

const handleJWTError = () =>
  new AppError('Invalid token, please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again', 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: '${err.keyValue.name}'. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (error) => {
  const validationErrors = Object.values(error.errors)
    .map((err) => err.message)
    .join('//');
  const message = `Provided data is not valid: ${validationErrors}`;
  return new AppError(message, 400);
};

const sendProdError = (error, response) => {
  // only errors we could predict
  if (error.isOperational) {
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    response.status(500).json({
      status: 'Error',
      message: 'An unexpected error ocurred',
    });
  }
};

const sendDevError = (error, response) => {
  response.status(error.statusCode).json({
    status: error.status,
    error,
    message: error.message,
    stack: error.stack,
  });
};

module.exports = (error, request, response, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // we want as many details of error as it is possible
  if (process.env.NODE_ENV === 'development') sendDevError(error, response);
  // we want to send basic info about error to client
  else if (process.env.NODE_ENV === 'production') {
    // we should not change arguments
    let errorObject = Object.assign(error);
    // Below code snapshot comes from Jonas Schmedtmann's NodeJS tutorial on udemy.
    // Every error connected with our DB data will have its own name or code:
    if (errorObject.name === 'ValidationError')
      errorObject = handleValidationErrorDB(errorObject);
    if (errorObject.name === 'CastError')
      errorObject = handleCastErrorDB(errorObject);
    if (errorObject.code === 11000)
      errorObject = handleDuplicateFieldsDB(errorObject);
    if (errorObject.name === 'JsonWebTokenError')
      errorObject = handleJWTError();
    if (errorObject.name === 'TokenExpiredError')
      errorObject = handleJWTExpiredError();

    sendProdError(errorObject, response);
  }

  next();
};
