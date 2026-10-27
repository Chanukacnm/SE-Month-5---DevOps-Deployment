const { ZodError } = require('zod');
const { ApiError } = require('../utils/errors');
const logger = require('../utils/logger');

function notFound(req, _res, next) {
  next(new ApiError(404, `No route for ${req.method} ${req.path}`));
}

// Express recognises error handlers by their four-argument signature.
function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const field = first.path.join('.');
    return res.status(400).json({ error: { message: field ? `${field}: ${first.message}` : first.message, issues: err.issues } });
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { message: err.message } });
  }
  // Malformed JSON bodies from express.json().
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Request body is not valid JSON' } });
  }
  logger.error('Unhandled error', { requestId: req.id, error: err.message, stack: err.stack });
  return res.status(500).json({ error: { message: 'Something went wrong on our side', requestId: req.id } });
}

module.exports = { notFound, errorHandler };
