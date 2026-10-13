function errorHandler(err, req, res, next) {
  console.error('[Error]', err);

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: 'Conflict: Duplicate record detected.',
      detail: err.detail,
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'Foreign key constraint violation. Referenced record does not exist.',
      detail: err.detail,
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
