const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        memory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Memory',
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
