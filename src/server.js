const app = require('./app');
const logger = require('./logger');

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Noticeboard API listening on http://localhost:${PORT}`);
});

module.exports = server;
