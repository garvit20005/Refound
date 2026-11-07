// A "Report this post" complaint made by a user against an item
const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      required: [true, 'Please select a reason'],
      enum: ['Spam', 'Fake or misleading', 'Inappropriate', 'Other'],
    },
    note: { type: String, trim: true, maxlength: 300, default: '' },
    status: { type: String, enum: ['Open', 'Resolved', 'Dismissed'], default: 'Open' },
  },
  { timestamps: true }
);

// One user can report the same post only once
flagSchema.index({ item: 1, reporter: 1 }, { unique: true });

module.exports = mongoose.model('Flag', flagSchema);
