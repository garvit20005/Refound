const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Flag = require('../models/Flag');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [users, items, claims, lostItems, foundItems, recovered, blockedUsers, openFlags] =
    await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Claim.countDocuments(),
      Item.countDocuments({ type: 'Lost' }),
      Item.countDocuments({ type: 'Found' }),
      Item.countDocuments({ status: 'Recovered' }),
      User.countDocuments({ isBlocked: true }),
      Flag.countDocuments({ status: 'Open' }),
    ]);

  res.json({ users, items, claims, lostItems, foundItems, recovered, blockedUsers, openFlags });
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });

  // How many items did each user report? (group items by user)
  const counts = await Item.aggregate([{ $group: { _id: '$user', count: { $sum: 1 } } }]);
  const countMap = {};
  counts.forEach((entry) => {
    countMap[entry._id.toString()] = entry.count;
  });

  const result = users.map((user) => ({
    ...user.toObject(),
    itemCount: countMap[user._id.toString()] || 0,
  }));

  res.json(result);
});

// PATCH /api/admin/users/:id/block   (block or unblock)
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot block yourself');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('You cannot block another admin');
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({ _id: user._id, isBlocked: user.isBlocked });
});

// GET /api/admin/items
const getAllItems = asyncHandler(async (req, res) => {
  const items = await Item.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(items);
});

// DELETE /api/admin/items/:id   (remove spam)
const deleteAnyItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  await Claim.deleteMany({ item: item._id });
  await Flag.deleteMany({ item: item._id });
  await item.deleteOne();

  res.json({ message: 'Item deleted' });
});

// GET /api/admin/flags
const getFlags = asyncHandler(async (req, res) => {
  const flags = await Flag.find()
    .populate('item', 'title type status')
    .populate('reporter', 'name email')
    .sort({ createdAt: -1 });
  res.json(flags);
});

// PATCH /api/admin/flags/:id   body: { status: 'Resolved' | 'Dismissed' }
const updateFlagStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Resolved', 'Dismissed'].includes(status)) {
    res.status(400);
    throw new Error('Status must be Resolved or Dismissed');
  }

  const flag = await Flag.findById(req.params.id);
  if (!flag) {
    res.status(404);
    throw new Error('Report not found');
  }

  flag.status = status;
  await flag.save();
  res.json(flag);
});

module.exports = {
  getStats,
  getUsers,
  toggleBlockUser,
  getAllItems,
  deleteAnyItem,
  getFlags,
  updateFlagStatus,
};
