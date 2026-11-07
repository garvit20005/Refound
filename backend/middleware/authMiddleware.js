// protect: only lets logged-in users continue
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not logged in. Please login first.');
  }

  const token = header.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error('Session expired. Please login again.');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    res.status(401);
    throw new Error('User no longer exists.');
  }

  // A blocked user cannot do anything, even with an old token
  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Please contact the admin.');
  }

  req.user = user; // available in controllers
  next();
});

// adminOnly: use after protect. Lets only admins continue.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Admin access only');
};

module.exports = { protect, adminOnly };
