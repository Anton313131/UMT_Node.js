const { validationError } = require('../middleware/error.middleware');

const CATEGORIES = ['sale', 'rent', 'buy', 'service', 'other'];
const SORT_FIELDS = ['createdAt', 'price', 'title'];
const ORDERS = ['asc', 'desc'];

function parseAnnouncementFields(body, { partial = false } = {}) {
  const errors = {};
  const out = {};

  if (!partial || body.title !== undefined) {
    const title = (body.title || '').trim();
    if (!title) {
      errors.title = 'Title is required';
    } else if (title.length < 5 || title.length > 100) {
      errors.title = 'Title must be between 5 and 100 characters';
    } else {
      out.title = title;
    }
  }

  if (!partial || body.description !== undefined) {
    const description = (body.description || '').trim();
    if (!description) {
      errors.description = 'Description is required';
    } else if (description.length < 10 || description.length > 500) {
      errors.description = 'Description must be between 10 and 500 characters';
    } else {
      out.description = description;
    }
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (body.price === '' || body.price === undefined || Number.isNaN(price)) {
      errors.price = 'Price is required';
    } else if (price < 0) {
      errors.price = 'Price must be a non-negative number';
    } else {
      out.price = price;
    }
  }

  if (!partial || body.category !== undefined) {
    if (!body.category) {
      errors.category = 'Category is required';
    } else if (!CATEGORIES.includes(body.category)) {
      errors.category = `Category must be one of: ${CATEGORIES.join(', ')}`;
    } else {
      out.category = body.category;
    }
  }

  if (!partial || body.contactInfo !== undefined) {
    const contactInfo = (body.contactInfo || '').trim();
    if (!contactInfo) {
      errors.contactInfo = 'Contact info is required';
    } else if (contactInfo.length < 5 || contactInfo.length > 100) {
      errors.contactInfo = 'Contact info must be between 5 and 100 characters';
    } else {
      out.contactInfo = contactInfo;
    }
  }

  return { out, errors };
}

function validateCreate(req, _res, next) {
  const { out, errors } = parseAnnouncementFields(req.body, { partial: false });
  if (Object.keys(errors).length > 0) return next(validationError(errors));
  req.validated = out;
  next();
}

function validateUpdate(req, _res, next) {
  const { out, errors } = parseAnnouncementFields(req.body, { partial: true });
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(validationError({ body: 'At least one field must be provided' }));
  }
  if (Object.keys(errors).length > 0) return next(validationError(errors));
  req.validated = out;
  next();
}

function validateListQuery(req, _res, next) {
  const errors = {};
  const q = req.query;

  let page = parseInt(q.page, 10);
  if (q.page !== undefined) {
    if (Number.isNaN(page) || page < 1) errors.page = 'page must be a positive integer';
  } else {
    page = 1;
  }

  let limit = parseInt(q.limit, 10);
  if (q.limit !== undefined) {
    if (Number.isNaN(limit) || limit < 1) {
      errors.limit = 'limit must be a positive integer';
    } else if (limit > 50) {
      errors.limit = 'limit must not exceed 50';
    }
  } else {
    limit = 5;
  }

  const search = q.search !== undefined ? String(q.search) : undefined;

  let category = q.category;
  if (category !== undefined && !CATEGORIES.includes(category)) {
    errors.category = `category must be one of: ${CATEGORIES.join(', ')}`;
  }

  const sortBy = q.sortBy || 'createdAt';
  if (!SORT_FIELDS.includes(sortBy)) {
    errors.sortBy = `sortBy must be one of: ${SORT_FIELDS.join(', ')}`;
  }

  const order = q.order || 'desc';
  if (!ORDERS.includes(order)) {
    errors.order = `order must be one of: ${ORDERS.join(', ')}`;
  }

  if (Object.keys(errors).length > 0) return next(validationError(errors));

  req.queryMeta = { page, limit, search, category, sortBy, order };
  next();
}

module.exports = {
  CATEGORIES,
  validateCreate,
  validateUpdate,
  validateListQuery,
  parseAnnouncementFields,
};
