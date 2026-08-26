const express = require('express');
const Subscription = require('../models/Subscription');
const { protect } = require('../middleware/auth');
const { success, error } = require('../utils/apiResponse');

const router = express.Router();

// Endpoint to retrieve VAPID public key so frontend can subscribe
router.get('/vapid-public-key', (req, res) => {
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post('/subscribe', protect, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    
    if (!endpoint || !keys) {
      return error(res, 400, 'Invalid subscription data.');
    }

    // Try to find existing or create new
    let sub = await Subscription.findOne({ endpoint });
    
    if (sub) {
      // Update user if they logged into a different account on same browser
      sub.user = req.user._id;
      sub.keys = keys;
      await sub.save();
    } else {
      sub = await Subscription.create({
        user: req.user._id,
        endpoint,
        keys
      });
    }

    return success(res, 201, 'Subscribed to push notifications successfully.', sub);
  } catch (err) {
    console.error('Subscribe Error:', err);
    return error(res, 500, 'Failed to subscribe to notifications.');
  }
});

module.exports = router;
