const express = require('express');
const {
  getUserCart,
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
} = require('../controllers/orders.controller');
const { protectSession } = require('../middlewares/auth.middlewares');


const router = express.Router();

router.use(protectSession)
  .get('/', getUserCart)
  .post('/add-product', addProductToCart)
  .patch('/update-cart', updateProductInCart)
  .post('/purchase', purchaseCart)
  .delete('/:productId', removeProductFromCart)

module.exports = { cartRouter: router };
