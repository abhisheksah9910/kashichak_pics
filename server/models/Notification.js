const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['memory_approved', 'memory_rejected', 'memory_liked', 'memory_commented'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        relatedMemory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Memory',
        },
        relatedPlace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Place',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
