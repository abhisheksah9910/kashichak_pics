const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    memory: { type: mongoose.Schema.Types.ObjectId, ref: 'Memory', required: true },
  },
  { timestamps: true }
);

// One like per user per memory, enforced at the database level.
likeSchema.index({ user: 1, memory: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
