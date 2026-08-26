const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      default: 'Welcome to Apna Kashichak!'
    },
    isActive: {
      type: Boolean,
      default: false
    },
    backgroundColor: {
      type: String,
      default: 'bg-terracotta-600' // tailwind class
    },
    link: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
