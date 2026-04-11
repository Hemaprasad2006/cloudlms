const errorHandler = (err, req, res, next) => {
  console.error(err.message);
  let status  = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Server error';
  if (err.name === 'CastError')       { status = 404; message = 'Resource not found.'; }
  if (err.code  === 11000)            { status = 400; message = 'Duplicate entry.'; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join('. '); }
  if (err.name === 'JsonWebTokenError') { status = 401; message = 'Invalid token.'; }
  res.status(status).json({ message });
};

module.exports = { errorHandler };