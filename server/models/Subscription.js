const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  keys: {
    p256dh: String,
    auth: String,
  }
}, { timestamps: true });

// Prevent duplicate subscriptions for the same endpoint
subscriptionSchema.index({ endpoint: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
