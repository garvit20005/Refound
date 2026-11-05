// Wraps async controllers so errors go to the error middleware
// (so we don't need try/catch in every function)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
