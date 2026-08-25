const mongoose = require('mongoose');

const beforeNowSchema = new mongoose.Schema(
  {
    place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true, index: true },
    beforeMemory: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory', required: true },
    nowMemory: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory', required: true },
    title: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BeforeNowComparison', beforeNowSchema);
