const pino = require('pino');

const isDev = process.env.NODE_ENV !== 'production';
const level = process.env.LOG_LEVEL || 'info';

const logger = isDev
  ? pino({ level }, pino.transport({ target: 'pino-pretty', options: { colorize: true } }))
  : pino({ level });

module.exports = logger;
