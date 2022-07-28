const { Product } = require('../models/product.model');

const { handlerAsync } = require('../utils/handlerAsync');
const { ErrorMessage } = require('../utils/errorMessageHandler');
const { User } = require('../models/user.model');

const protectProductOwner = handlerAsync(async (req, res, next) => {
  const { product } = req;
  const { sessionUser } = req;

  if (product.user.dataValues.id !== sessionUser.id) {
    return next(new ErrorMessage("You don't owner of this product"));
  }

  next();
});

const productExists = handlerAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({
    where: { id, status: 'active' },
    include: [
      {
        model: User,
        attributes: ['username', 'email', 'id'],
      },
    ],
  });

  console.log(product.user.dataValues.id);

  if (!product) {
    return next(new ErrorMessage('Could not find product by given id', 404));
  }

  req.product = product;
  next();
});

module.exports = { protectProductOwner, productExists };
