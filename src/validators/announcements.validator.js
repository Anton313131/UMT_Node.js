const { celebrate, Joi, Segments } = require('celebrate');

const CATEGORIES = ['sale', 'rent', 'buy', 'service', 'other'];
const SORT_FIELDS = ['createdAt', 'price', 'title'];
const ORDERS = ['asc', 'desc'];
const OPTS = { abortEarly: false };

const announcementSchema = {
  title: Joi.string().min(5).max(100),
  description: Joi.string().min(10).max(500),
  price: Joi.number().min(0),
  category: Joi.string().valid(...CATEGORIES),
  contactInfo: Joi.string().min(5).max(100),
};

const validateCreate = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    price: Joi.number().min(0).required(),
    category: Joi.string().valid(...CATEGORIES).required(),
    contactInfo: Joi.string().min(5).max(100).required(),
  }),
}, OPTS);

const validateUpdate = celebrate({
  // Partial update: only validate provided fields (image-only updates allowed)
  [Segments.BODY]: Joi.object(announcementSchema).min(0),
}, OPTS);

const validateListQuery = celebrate({
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(5),
    search: Joi.string().allow(''),
    category: Joi.string().valid(...CATEGORIES),
    sortBy: Joi.string().valid(...SORT_FIELDS).default('createdAt'),
    order: Joi.string().valid(...ORDERS).default('desc'),
  }),
}, OPTS);

module.exports = {
  CATEGORIES,
  SORT_FIELDS,
  ORDERS,
  validateCreate,
  validateUpdate,
  validateListQuery,
};
