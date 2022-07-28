const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const { User } = require('../models/user.model');

const { handlerAsync } = require('../utils/handlerAsync');
const { ErrorMessage } = require('../utils/errorMessageHandler');
const { Product } = require('../models/product.model');
const { Order } = require('../models/order.model');

dotenv.config({ path: './config.env' });

const getAllUsers = handlerAsync(async (req, res, next) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
  });

  res.status(200).json({
    users,
  });
});

const createUser = handlerAsync(async (req, res, next) => {
  const { username, email, password, role } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashPassword,
    role,
  });

  newUser.password = undefined;

  res.status(201).json({ newUser });
});

const getUserById = handlerAsync(async (req, res, next) => {
  const { user } = req;

  res.status(200).json({
    user,
  });
});

const updateUser = handlerAsync(async (req, res, next) => {
  const { user } = req;
  const { name } = req.body;

  await user.update({ name });

  res.status(200).json({ status: 'success' });
});

const deleteUser = handlerAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({ status: 'deleted' });

  res.status(200).json({
    status: 'success',
  });
});

const login = handlerAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: { email, status: 'active' },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new ErrorMessage('Invalid credentials', 400));
  }

  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;

  res.status(200).json({ token, user });
});

const checkToken = handlerAsync(async (req, res, next) => {
  res.status(200).json({ user: req.sessionUser });
});

const getUserProducts = handlerAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const products = await Product.find({
    where: { userId: sessionUser.id, status: 'active' },
  });

  res.status(200).json({
    status: 'success',
    products,
  });
});

const getUserOrders = handlerAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const orders = await Order.findAll({
    where: { userId: sessionUser.id },
  });

  res.status(200).json({ status: 'success', orders });
});

const getUserOrderById = handlerAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { id } = req.params;

  const order = await Order.findOne({
    where: { id, userId: sessionUser.id },
  });

  res.status(200).json({ status: 'success', order });
});

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  login,
  checkToken,
  getUserProducts,
  getUserOrders,
  getUserOrderById,
};
