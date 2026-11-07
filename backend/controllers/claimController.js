const Claim = require('../models/Claim');
const Item = require('../models/Item');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/claims
const createClaim = asyncHandler(async (req, res) => {
  const { itemId, message, details } = req.body;

  if (!itemId || !message || message.trim().length < 10) {
    res.status(400);
    throw new Error('Please write a message (at least 10 characters)');
  }

  const item = await Item.findById(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }
  if (item.type !== 'Found') {
    res.status(400);
    throw new Error('You can only claim found items');
  }
  if (item.status !== 'Active') {
    res.status(400);
    throw new Error('This item is no longer open for claims');
  }
  if (item.user.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot claim your own item');
  }

  const alreadyClaimed = await Claim.findOne({ item: itemId, claimant: req.user._id });
  if (alreadyClaimed) {
    res.status(400);
    throw new Error('You have already sent a claim for this item');
  }

  const claim = await Claim.create({
    item: itemId,
    claimant: req.user._id,
    message,
    details,
  });

  res.status(201).json(claim);
});

// GET /api/claims/my  -> claims I sent
const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ claimant: req.user._id })
    .populate({
      path: 'item',
      select: 'title image type status user',
      populate: { path: 'user', select: 'name phone email' },
    })
    .sort({ createdAt: -1 });

  // Hide the finder's contact details until the claim is accepted
  const result = claims.map((claim) => {
    const data = claim.toObject();
    if (data.item && data.item.user && claim.status !== 'Accepted') {
      data.item.user = { name: data.item.user.name };
    }
    return data;
  });

  res.json(result);
});

// GET /api/claims/received  -> claims on found items I reported
const getReceivedClaims = asyncHandler(async (req, res) => {
  const myFoundItems = await Item.find({ user: req.user._id, type: 'Found' }).select('_id');
  const itemIds = myFoundItems.map((item) => item._id);

  const claims = await Claim.find({ item: { $in: itemIds } })
    .populate('item', 'title image type status')
    .populate('claimant', 'name phone email')
    .sort({ createdAt: -1 });

  // Hide the claimant's contact details until I accept the claim
  const result = claims.map((claim) => {
    const data = claim.toObject();
    if (data.claimant && claim.status !== 'Accepted') {
      data.claimant = { name: data.claimant.name };
    }
    return data;
  });

  res.json(result);
});

// PATCH /api/claims/:id  body: { status: 'Accepted' | 'Rejected' }
const updateClaimStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['Accepted', 'Rejected'].includes(status)) {
    res.status(400);
    throw new Error('Status must be Accepted or Rejected');
  }

  const claim = await Claim.findById(req.params.id).populate('item');
  if (!claim) {
    res.status(404);
    throw new Error('Claim not found');
  }

  // Only the person who reported the found item can decide
  if (claim.item.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not allowed to manage this claim');
  }
  if (claim.status !== 'Pending') {
    res.status(400);
    throw new Error('This claim has already been decided');
  }

  if (status === 'Accepted') {
    if (claim.item.status !== 'Active') {
      res.status(400);
      throw new Error('This item already has an accepted claim');
    }
    claim.item.status = 'Claimed';
    await claim.item.save();

    // Reject all other pending claims on this item
    await Claim.updateMany(
      { item: claim.item._id, _id: { $ne: claim._id }, status: 'Pending' },
      { status: 'Rejected' }
    );
  }

  claim.status = status;
  await claim.save();

  res.json(claim);
});

// DELETE /api/claims/:id  -> claimant cancels their own pending claim
const cancelClaim = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id).populate('item');
  if (!claim) {
    res.status(404);
    throw new Error('Claim not found');
  }

  if (claim.claimant.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only cancel your own claims');
  }
  if (claim.status !== 'Pending') {
    res.status(400);
    throw new Error('Only pending claims can be cancelled');
  }

  await claim.deleteOne();

  res.json({ message: 'Claim cancelled' });
});

module.exports = {
  createClaim,
  getMyClaims,
  getReceivedClaims,
  updateClaimStatus,
  cancelClaim,
};
