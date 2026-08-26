const webpush = require('web-push');
const Subscription = require('../models/Subscription');

// Set VAPID details
webpush.setVapidDetails(
  'mailto:your-email@example.com', // In a real app this should be from env
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Sends a push notification to a specific user
 * @param {string} userId - The target user's ID
 * @param {object} payload - The notification payload
 */
const sendPushToUser = async (userId, payload) => {
  try {
    const subscriptions = await Subscription.find({ user: userId });
    
    if (subscriptions.length === 0) return; // User has no registered devices

    const payloadString = JSON.stringify(payload);

    // Send to all registered devices for the user
    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: sub.keys
        };
        await webpush.sendNotification(pushSubscription, payloadString);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid, remove it
          await Subscription.deleteOne({ _id: sub._id });
        } else {
          console.error('Error sending push notification:', err);
        }
      }
    }
  } catch (error) {
    console.error('Error in sendPushToUser:', error);
  }
};

module.exports = { sendPushToUser };
