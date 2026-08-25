const Notification = require('../models/Notification');
const { success, error } = require('../utils/apiResponse');

// GET /api/notifications
const getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        return success(res, 200, 'Notifications fetched.', notifications);
    } catch (err) {
        next(err);
    }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) return error(res, 404, 'Notification not found.');
        return success(res, 200, 'Notification marked as read.', notification);
    } catch (err) {
        next(err);
    }
};

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );
        return success(res, 200, 'All notifications marked as read.');
    } catch (err) {
        next(err);
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
