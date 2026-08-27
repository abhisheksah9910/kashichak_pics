const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
  {
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    place: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Place', 
      required: function() { return this.featuredLabel !== 'historical'; }, 
      index: true 
    },

    mediaType: { type: String, enum: ['photo', 'video'], required: true },
    googleDriveFileId: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    originalFileName: { type: String, required: true },
    fileSize: { type: Number, required: true }, // bytes
    mimeType: { type: String, required: true },

    caption: { type: String, required: true, trim: true, maxlength: 150 },
    story: { type: String, default: '', maxlength: 3000 },
    tags: [{ type: String, trim: true, lowercase: true }],
    dateCaptured: { type: Date, required: true },

    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    rejectionReason: { type: String, default: '' },

    isFeatured: { type: Boolean, default: false },
    featuredLabel: { type: String, enum: ['', 'featured', 'memory_of_the_week', 'historical'], default: '' },
    rejectedAt: { type: Date, default: null },

    likeCount: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

memorySchema.index({ caption: 'text', story: 'text', tags: 'text' });
memorySchema.index({ place: 1, status: 1, dateCaptured: -1 });
memorySchema.index({ place: 1, status: 1, createdAt: -1 });
memorySchema.index({ uploader: 1, status: 1, createdAt: -1 });
memorySchema.index({ featuredLabel: 1, status: 1, dateCaptured: -1 });

module.exports = mongoose.model('Memory', memorySchema);
