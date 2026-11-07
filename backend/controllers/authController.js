const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

// Only send safe user data to the frontend (never the password)
const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  location: user.location,
  role: user.role,
  createdAt: user.createdAt,
});

// POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, location } = req.body;

  if (!name || !email || !password || !phone || !location) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, phone, location });

  res.status(201).json({ user: userResponse(user), token: generateToken(user._id) });
});

// POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Blocked users cannot login
  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Please contact the admin.');
  }

  res.json({ user: userResponse(user), token: generateToken(user._id) });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json(userResponse(req.user));
});

// PUT /api/auth/profile  (update name, phone, location)
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, location } = req.body;

  if (!name || !phone || !location) {
    res.status(400);
    throw new Error('Name, phone and location are required');
  }

  const user = await User.findById(req.user._id);
  user.name = name;
  user.phone = phone;
  user.location = location;
  await user.save();

  res.json(userResponse(user));
});

// PUT /api/auth/password  (change password)
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please enter your current and new password');
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }
  if (currentPassword === newPassword) {
    res.status(400);
    throw new Error('New password must be different from the current one');
  }

  // req.user has no password (protect removed it), so load the user again
  const user = await User.findById(req.user._id);

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword; // the pre-save hook hashes it
  await user.save();

  res.json({ message: 'Password changed successfully' });
});

module.exports = { registerUser, loginUser, getMe, updateProfile, changePassword };
