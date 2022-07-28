const { Cart } = require('../models/cart.model');
const { Product } = require('../models/product.model');
const { ProductInCart } = require('../models/productInCart.model');

const { handlerAsync } = require('../utils/handlerAsync');
const { ErrorMessage } = require('../utils/errorMessageHandler');
const { Order } = require('../models/order.model');

const getUserCart = handlerAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    include: { model: ProductInCart },
  });

  res.status(200).json({
    status: 'success',
    cart,
  });
});

const addProductToCart = handlerAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId, quantity } = req.body;

  const product = await Product.findOne({
    where: { id: productId, status: 'active' },
  });

  if (!product) {
    return next(new ErrorMessage('Invalid product', 404));
  } else if (quantity > product.quantity) {
    return next(
      new ErrorMessage(
        `This product only has ${product.quantity} items available`,
        400
      )
    );
  }

  const cart = await Cart.findOne({
    where: { status: 'active', userId: sessionUser.id },
  });

  if (!cart) {
    const newCart = await Cart.create({ userId: sessionUser.id });

    await ProductInCart.create({
      cartId: newCart.id,
      productId,
      quantity,
    });
  } else {
    const productExists = await ProductInCart.findOne({
      where: { cartId: cart.id, productId },
    });

    if (productExists && productExists.status === 'removed') {
      productExists &&
        (await productExists.update({ quantity, status: 'active' }));

      return next(new ErrorMessage('Product is already in the cart', 400));
    }

    await ProductInCart.create({ cartId: cart.id, productId, quantity });
  }

  res.status(200).json({ status: 'success' });
});

const updateProductInCart = handlerAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId, newQuantity } = req.body;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id },
  });

  if (!cart) {
    return next(new ErrorMessage("there isn't cart for this user", 404));
  }

  const productInCart = await ProductInCart.findOne({
    where: { productId, status: 'active', cartId: cart.id },
    include: { model: Product },
  });

  if (!productInCart) {
    return next(new ErrorMessage('this product does not exist in a cart', 404));
  } else if (productInCart.product.quantity < newQuantity) {
    return next(
      new ErrorMessage(
        `this product only has ability for ${productInCart.quantity} quantity `,
        400
      )
    );
  } else if (newQuantity <= 0) {
    await productInCart.update({ quantity: 0, status: 'removed' });

    return res.status(200).json({
      status: 'success',
      message: 'the quantity of this product has been seted to 0',
    });
  }

  await productInCart.update({ quantity: newQuantity });

  res.status(200).json({ status: 'success' });
});

const purchaseCart = handlerAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { status: 'active', userId: sessionUser.id },
    include: { model: ProductInCart, where: { status: 'active' } },
  });

  if (!cart) {
    return next(
      new ErrorMessage('the cart for this user does not exists', 404)
    );
  }

  let totalPrice = 0;

  await Promise.all(
    cart.productInCarts?.map(async productInCart => {
      const product = await Product.findOne({
        where: { id: productInCart.productId },
      });

      const priceTotalProduct = product.price * productInCart.quantity;

      totalPrice += priceTotalProduct;

      await product.update({
        quantity: product.quantity - productInCart.quantity,
      });

      await productInCart.update({ status: 'purchased' });
    })
  );

  cart.update({ status: 'purchased' });

  const order = await Order.create({
    userId: sessionUser.id,
    cartId: cart.id,
    totalPrice,
  });

  res.status(200).json({ status: 'success', order });
});

const removeProductFromCart = handlerAsync(async (req, res, next) => {
  const { productId } = req.params;

  const product = await ProductInCart.findOne({
    where: {
      id: productId,
      status: 'active',
    },
  });

  if (!product) {
    return next(new ErrorMessage('this product not found', 404));
  }

  product.update({ quantity: 0, status: 'removed' });
  res.status(200).json({ status: 'success' });
});

module.exports = {
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
  getUserCart,
};
