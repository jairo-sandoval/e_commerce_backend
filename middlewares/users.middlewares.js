const { User } = require('../models/user.model');
const { ErrorMessage } = require('../utils/errorMessageHandler');
const { handlerAsync } = require('../utils/handlerAsync');

const userExists = handlerAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOne({
    where: { id, status: 'active' },
    attributes: { exclude: ['password'] },
  });

  if (!user) {
    return next(new ErrorMessage('User not found', 404));
  }

  req.user = user;
  next();
});

const protectAccountOwner = handlerAsync(async (req, res, next) => {
  const { sessionUser, user } = req;

  if (sessionUser.id !== user.id) {
    return next(new ErrorMessage('You dont owner of this account', 403));
  }

  next();
});

module.exports = {
  userExists,
  protectAccountOwner,
};
