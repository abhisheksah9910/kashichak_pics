const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    memory: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory', required: true },
    reason: {
      type: String,
      enum: ['inappropriate', 'wrong_place', 'copyright', 'spam', 'other'],
      required: true,
    },
    description: { type: String, default: '', maxlength: 500 },
    status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
    resolution: { type: String, enum: ['', 'removed', 'kept', 'warned'], default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
