const jwt = require('jsonwebtoken');

const { User } = require('../models/user.model');

const { handlerAsync } = require('../utils/handlerAsync');
const { ErrorMessage } = require('../utils/errorMessageHandler');

const protectSession = handlerAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorMessage('Session invalid', 403));
  }

  const decoded = await jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findOne({
    where: { id: decoded.id, status: 'active' },
  });

  if (!user) {
    return next(
      new ErrorMessage('The owner of this token is no longer available', 403)
    );
  }

  req.sessionUser = user;
  next();
});

const protectAdmin = handlerAsync(async (req, res, next) => {
  if (req.sessionUser.role !== 'admin') {
    return next(new ErrorMessage('You dont role up for make this action', 403));
  }

  next();
});

module.exports = {
  protectSession,
  protectAdmin,
};
