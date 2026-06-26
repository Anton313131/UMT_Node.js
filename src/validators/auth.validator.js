const { validationError } = require('../middleware/error.middleware');

function validateRegister(body) {
  const errors = {};
  const username = (body.username || '').trim();
  const password = body.password || '';

  if (!username) {
    errors.username = 'Username is required';
  } else if (username.length < 4 || username.length > 30) {
    errors.username = 'Username must be between 4 and 30 characters';
  }

  if (body.name !== undefined && body.name !== null && String(body.name).length > 50) {
    errors.name = 'Name must be at most 50 characters';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6 || password.length > 100) {
    errors.password = 'Password must be between 6 and 100 characters';
  }

  return errors;
}

function validateLogin(body) {
  const errors = {};
  if (!body.username || !body.username.trim()) errors.username = 'Username is required';
  if (!body.password) errors.password = 'Password is required';
  return errors;
}

function validateRegisterMiddleware(req, _res, next) {
  const errors = validateRegister(req.body);
  if (Object.keys(errors).length > 0) return next(validationError(errors));
  next();
}

function validateLoginMiddleware(req, _res, next) {
  const errors = validateLogin(req.body);
  if (Object.keys(errors).length > 0) return next(validationError(errors));
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateRegisterMiddleware,
  validateLoginMiddleware,
};
