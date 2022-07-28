const { Category } = require('../models/category.model');

const { handlerAsync } = require('../utils/handlerAsync');
const { ErrorMessage } = require('../utils/errorMessageHandler');

const getAllCategories = handlerAsync(async (req, res, next) => {
  const categories = await Category.findAll({ where: { status: 'active' } });

  res.status(200).json({ categories });
});

const createCategory = handlerAsync(async (req, res, next) => {
  const { name } = req.body;

  if (name.length === 0) {
    return next(new ErrorMessage('Name cannot be empty', 400));
  }

  const newCategory = await Category.create({ name });

  res.status(201).json({
    newCategory,
  });
});

const updateCategory = handlerAsync(async (req, res, next) => {
  const { newName } = req.body;
  const { id } = req.params;

  const category = await Category.findOne({
    where: { id, status: 'active' },
  });

  if (!category) {
    return next(new ErrorMessage('Category does not exits with given id', 404));
  }

  if (newName.length === 0) {
    return next(new ErrorMessage('The updated name cannot be empty', 400));
  }

  await category.update({ name: newName });

  res.status(200).json({ status: 'success' });
});

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
};
