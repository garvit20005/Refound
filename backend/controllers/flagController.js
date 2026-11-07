const Flag = require('../models/Flag');
const Item = require('../models/Item');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/flags   body: { itemId, reason, note }
const createFlag = asyncHandler(async (req, res) => {
  const { itemId, reason, note } = req.body;

  if (!itemId || !reason) {
    res.status(400);
    throw new Error('Please select a reason');
  }

  const item = await Item.findById(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  if (item.user.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot report your own post');
  }

  const alreadyFlagged = await Flag.findOne({ item: itemId, reporter: req.user._id });
  if (alreadyFlagged) {
    res.status(400);
    throw new Error('You have already reported this post');
  }

  await Flag.create({ item: itemId, reporter: req.user._id, reason, note });

  res.status(201).json({ message: 'Thank you. The admin will review this post.' });
});

module.exports = { createFlag };
