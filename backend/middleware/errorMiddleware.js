// Handles unknown routes and all errors in one place

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message;

  // Mongoose validation error (e.g. required field missing)
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  // Invalid MongoDB id
  if (err.name === 'CastError') {
    status = 404;
    message = 'Resource not found';
  }
  // Duplicate value (unique index)
  if (err.code === 11000) {
    status = 400;
    message = 'This already exists';
  }
  // Upload errors (file too large etc.)
  if (err.name === 'MulterError') {
    status = 400;
  }

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
