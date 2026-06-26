const { celebrate, Joi, Segments } = require('celebrate');

const OPTS = { abortEarly: false };

const validateRegister = celebrate({
  [Segments.BODY]: Joi.object({
    username: Joi.string().pattern(/^[a-zA-Z0-9_]+$/).min(4).max(30).required(),
    name: Joi.string().max(50).allow('', null),
    password: Joi.string().min(6).max(100).required(),
  }),
}, OPTS);

const validateLogin = celebrate({
  [Segments.BODY]: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
}, OPTS);

module.exports = { validateRegister, validateLogin, Joi };
