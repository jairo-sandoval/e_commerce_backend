const express = require('express');
const {
  userExists,
  protectAccountOwner,
} = require('../middlewares/users.middlewares');
const { protectSession } = require('../middlewares/auth.middlewares');
const {
  createUserValidations,
  checkValidations,
} = require('../middlewares/validations.middlewares');
const {
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
} = require('../controllers/users.controller');

const router = express.Router();

router.post('/', createUserValidations, checkValidations, createUser);
router.post('/login', login);

router
  .use(protectSession)
  .get('/', getAllUsers)
  .get('/me', getUserProducts)
  .get('/orders', getUserOrders)
  .get('/orders/:id', getUserOrderById)

  .route('/:id')
  .get(userExists, getUserById)
  .patch(userExists, protectAccountOwner, updateUser)
  .delete(userExists, protectAccountOwner, deleteUser);

module.exports = { usersRouter: router };
