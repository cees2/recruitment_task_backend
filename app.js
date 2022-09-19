const express = require('express');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const itemsRouter = require('./routes/itemsRoutes');

const app = express();

// request details
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// body parser
app.use(express.json({ limit: '10kb' }));

// routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/items', itemsRouter);

// route not found
app.use('*', (request, response) => {
  response.status(404).json({
    status: 'fail',
    message: 'Could not find that resource.',
  });
});

app.use(globalErrorHandler);

module.exports = app;
