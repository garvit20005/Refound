const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Flag = require('../models/Flag');
const asyncHandler = require('../utils/asyncHandler');
const uploadToCloudinary = require('../utils/uploadToCloudinary');

// Makes user text safe to use inside a search pattern
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Check required fields for create/update
const validateItemBody = (body, res) => {
  const { title, description, category, type, location, date } = body;
  if (!title || !description || !category || !type || !location || !date) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }
  if (!['Lost', 'Found'].includes(type)) {
    res.status(400);
    throw new Error('Type must be Lost or Found');
  }
};

// Find an item and make sure the logged-in user owns it
const getOwnedItem = async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  if (item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only change your own reports');
  }
  return item;
};

// GET /api/items?search=&category=&type=&location=&sort=latest|oldest
const getItems = asyncHandler(async (req, res) => {
  const { search, category, type, location, sort } = req.query;
  const filter = {};

  if (search) filter.title = { $regex: escapeRegex(search), $options: 'i' };
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };

  const sortOrder = sort === 'oldest' ? 1 : -1;

  // populate('user', 'name') -> only the reporter's NAME is sent (privacy)
  const items = await Item.find(filter)
    .populate('user', 'name')
    .sort({ createdAt: sortOrder });

  res.json(items);
});

// GET /api/items/my
const getMyItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
});

// GET /api/items/:id
const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).populate('user', 'name');
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  res.json(item);
});

// POST /api/items
const createItem = asyncHandler(async (req, res) => {
  validateItemBody(req.body, res);
  const { title, description, category, type, location, date } = req.body;

  let image = '';
  if (req.file) image = await uploadToCloudinary(req.file.buffer);

  const item = await Item.create({
    title,
    description,
    category,
    type,
    location,
    date,
    image,
    user: req.user._id,
  });

  res.status(201).json(item);
});

// PUT /api/items/:id
const updateItem = asyncHandler(async (req, res) => {
  const item = await getOwnedItem(req, res);
  validateItemBody(req.body, res);
  const { title, description, category, type, location, date } = req.body;

  item.title = title;
  item.description = description;
  item.category = category;
  item.type = type;
  item.location = location;
  item.date = date;

  // Replace the image only if a new one was uploaded
  if (req.file) item.image = await uploadToCloudinary(req.file.buffer);

  const updated = await item.save();
  res.json(updated);
});

// PATCH /api/items/:id/recovered
const markRecovered = asyncHandler(async (req, res) => {
  const item = await getOwnedItem(req, res);
  item.status = 'Recovered';
  await item.save();
  res.json(item);
});

// DELETE /api/items/:id
const deleteItem = asyncHandler(async (req, res) => {
  const item = await getOwnedItem(req, res);
  await Claim.deleteMany({ item: item._id }); // remove its claims too
  await Flag.deleteMany({ item: item._id }); // and its complaints
  await item.deleteOne();
  res.json({ message: 'Item deleted' });
});

module.exports = {
  getItems,
  getMyItems,
  getItemById,
  createItem,
  updateItem,
  markRecovered,
  deleteItem,
};
