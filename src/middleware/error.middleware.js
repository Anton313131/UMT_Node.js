const { isCelebrateError } = require('celebrate');
const logger = require('../logger');

// ponytail: single error handler, no error class hierarchy — statusFromError covers needs
function statusFromError(err) {
  if (err && (isCelebrateError(err) || err.isJoi)) return 400;
  if (err && err.code === 'LIMIT_FILE_SIZE') return 413;
  if (err && err.name === 'MulterError') return 400;
  if (err && err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') return 409;
    if (err.code === 'P2025') return 404;
  }
  return err.status || 500;
}

function celebrateErrors(err) {
  const errors = {};
  if (isCelebrateError(err)) {
    for (const [segment, joiError] of err.details.entries()) {
      for (const d of joiError.details) {
        const key = (d.context?.key) || (d.path && d.path[0]) || '_';
        if (!errors[key]) errors[key] = d.message.replace(/"/g, '');
      }
    }
    return errors;
  }
  const details = err.details || [];
  for (const d of details) {
    const key = (d.context?.key) || (d.path && d.path[0]) || '_';
    if (!errors[key]) errors[key] = d.message.replace(/"/g, '');
  }
  return errors;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = statusFromError(err);
  if (status >= 500) {
    req.log?.error({ err }, 'Unhandled server error');
  } else {
    req.log?.warn({ err: err.message }, 'Request error');
  }

  if (err && (isCelebrateError(err) || err.isJoi)) {
    return res.status(400).json({ errors: celebrateErrors(err) });
  }

  if (err && err.code === 'P2002') {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  const message = status >= 500 ? 'Internal server error' : err.message;
  res.status(status).json({ error: message });
}

function notFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

module.exports = { errorHandler, notFound };
