export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Something went wrong with the database operation'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      message: err.message || 'Invalid input data',
      details: err.details || null
    });
  }

  // Cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format',
      message: 'The provided ID is not valid'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
