const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    googleDriveFileId: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slot: {
      type: String,
      enum: ['home_middle', 'explore_sidebar', 'general'],
      default: 'general',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ad', adSchema);
