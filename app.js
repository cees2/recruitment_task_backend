const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const itemsRouter = require('./routes/itemsRoutes');

const app = express();

dotenv.config({ path: './config.env' });

app.use(helmet());

app.use((request, response, next) => {
  response.append(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE'
  );
  response.append('Access-Control-Allow-Headers', 'Content-Type');
  response.append('Access-Control-Allow-Credentials', true);
  next();
});

// request details
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//body parsers
app.use(cookieParser());
app.use(express.json({ limit: '20kb' }));

//data sanitization
app.use(mongoSanitize());
app.use(xss());

//limiter
app.use(
  rateLimit({
    max: 100,
    windowMs: 30 * 60 * 1000,
    message: 'Too many requests.',
  })
);

app.use(hpp());
app.use(cors());

app.use(compression());

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
