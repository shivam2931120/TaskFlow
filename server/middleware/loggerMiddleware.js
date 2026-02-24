// Logger Middleware (Morgan integration)
// yeh middleware HTTP requests ko log karta hai Morgan ke through

const morgan = require('morgan');
const logger = require('../utils/logger');

// Morgan ka stream Winston logger se connect karo
const stream = {
  write: (message) => {
    // Newline character hatao message se
    logger.info(message.trim());
  },
};

// Morgan middleware configure karo - combined format use karenge
const loggerMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);

module.exports = loggerMiddleware;
