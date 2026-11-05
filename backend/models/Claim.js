const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: {
      type: String,
      required: [true, 'Please explain why this item is yours'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: 1000,
    },
    // identifying details (e.g. colour, scratches, serial number)
    details: { type: String, trim: true, maxlength: 500, default: '' },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  },
  { timestamps: true }
);

// One user can claim one item only once
claimSchema.index({ item: 1, claimant: 1 }, { unique: true });

module.exports = mongoose.model('Claim', claimSchema);
