const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics',
  'Bags & Wallets',
  'Documents & IDs',
  'Keys',
  'Clothing',
  'Jewelry',
  'Books',
  'Pets',
  'Other',
];

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 80 },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 1000,
    },
    category: { type: String, required: [true, 'Category is required'], enum: CATEGORIES },
    type: { type: String, required: true, enum: ['Lost', 'Found'] },
    image: { type: String, default: '' },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      validate: {
        validator: (value) => value <= new Date(),
        message: 'Date cannot be in the future',
      },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Active', 'Claimed', 'Recovered'], default: 'Active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
