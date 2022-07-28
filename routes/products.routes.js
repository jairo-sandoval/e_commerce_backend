const express = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products.controller');
const {
  getAllCategories,
  createCategory,
  updateCategory,
} = require('../controllers/categories.controller');

const { protectSession } = require('../middlewares/auth.middlewares');
const {
  createProductValidations,
  checkValidations,
} = require('../middlewares/validations.middlewares');
const {
  protectProductOwner,
  productExists,
} = require('../middlewares/products.middlewares');

const router = express.Router();

router.get('/', getAllProducts);

router.get('/categories', getAllCategories);

router.get('/:id', productExists, getProductById);

router
  .use(protectSession)
  .post('/', createProductValidations, checkValidations, createProduct)
  .post('/categories', createCategory)
  .patch('/categories/:id', updateCategory)

  .use('/:id', productExists)
  .route('/:id')
  .patch(protectProductOwner, updateProduct)
  .delete(protectProductOwner, deleteProduct);

module.exports = { productsRouter: router };
