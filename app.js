const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const { globalErrorHandler } = require('./controllers/error.controller');

const { usersRouter } = require('./routes/users.routes');
const { productsRouter } = require('./routes/products.routes');
const { cartRouter } = require('./routes/cart.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('common'));

const limiter = rateLimit({
  max: 10000,
  windowMs: 1 * 60 * 60 * 1000,
  message: 'Too many requests from this IP',
});

app.use(limiter);

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/cart', cartRouter);

app.use(globalErrorHandler);

module.exports = { app };
