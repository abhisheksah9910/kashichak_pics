const Memory = require('../models/Memory');
const Place = require('../models/Place');
const Like = require('../models/Like');
const driveService = require('../services/googleDriveService');
const { success, error } = require('../utils/apiResponse');
const { ALLOWED_IMAGE_TYPES, MAX_IMAGE_MB, MAX_VIDEO_MB } = require('../middleware/upload');

const listMemories = async (req, res, next) => {
  try {
    const { place, type, year, tag, uploader, label, sort = 'newest', page = 1, limit = 18 } = req.query;
    const filter = { status: 'approved' };

    if (place) {
      const placeDoc = await Place.findOne({ slug: place });
      if (!placeDoc) return success(res, 200, 'Memories fetched.', [], { total: 0, page: 1, pages: 0 });
      filter.place = placeDoc._id;
    }
    if (uploader) filter.uploader = uploader;
    if (type) filter.mediaType = type;
    if (tag) filter.tags = tag.toLowerCase();
    if (label) filter.featuredLabel = label;
    if (year) {
      filter.dateCaptured = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31T23:59:59`),
      };
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest_captured: { dateCaptured: 1 },
      newest_captured: { dateCaptured: -1 },
      most_liked: { likeCount: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [memories, total] = await Promise.all([
      Memory.find(filter)
        .populate('uploader', 'name profileImage')
        .populate('place', 'name slug')
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(Number(limit)),
      Memory.countDocuments(filter),
    ]);

    return success(res, 200, 'Memories fetched.', memories, {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/memories/timeline?place=slug  -> memories grouped by year
const getTimeline = async (req, res, next) => {
  try {
    const { place } = req.query;
    if (!place) return error(res, 400, 'place is required.');
    const placeDoc = await Place.findOne({ slug: place });
    if (!placeDoc) return error(res, 404, 'Place not found.');

    const grouped = await Memory.aggregate([
      { $match: { place: placeDoc._id, status: 'approved' } },
      {
        $group: {
          _id: { $year: '$dateCaptured' },
          count: { $sum: 1 },
          memories: { $push: { _id: '$_id', mediaType: '$mediaType', thumbnailUrl: '$thumbnailUrl', caption: '$caption', dateCaptured: '$dateCaptured' } },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    return success(res, 200, 'Timeline fetched.', grouped);
  } catch (err) {
    next(err);
  }
};

// POST /api/memories  (authenticated, multipart/form-data, field name "media")
const uploadMemory = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 400, 'A photo or video file is required.');
    const { placeId, caption, story, dateCaptured, tags, featuredLabel } = req.body;

    let finalFeaturedLabel = '';
    if (featuredLabel === 'historical' && req.user.role === 'admin') {
      finalFeaturedLabel = 'historical';
    }

    if (!caption || !dateCaptured) {
      return error(res, 400, 'caption and dateCaptured are required.');
    }

    if (finalFeaturedLabel !== 'historical' && !placeId) {
      return error(res, 400, 'placeId is required for regular memories.');
    }

    let place = null;
    if (placeId) {
      place = await Place.findById(placeId);
      if (!place || place.status !== 'approved') return error(res, 404, 'Selected place not found.');
    }

    const mediaType = ALLOWED_IMAGE_TYPES.includes(req.file.mimetype) ? 'photo' : 'video';
    const maxBytes = (mediaType === 'photo' ? MAX_IMAGE_MB : MAX_VIDEO_MB) * 1024 * 1024;
    if (req.file.size > maxBytes) {
      return error(res, 400, `File too large. Max size for ${mediaType}s is ${mediaType === 'photo' ? MAX_IMAGE_MB : MAX_VIDEO_MB}MB.`);
    }

    // Upload the original file, untouched, to Google Drive.
    const { fileId, mediaUrl, thumbnailUrl } = await driveService.uploadFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });



    const status = req.user.role === 'admin' ? 'approved' : 'pending';

    const memory = await Memory.create({
      uploader: req.user._id,
      place: place ? place._id : undefined,
      mediaType,
      googleDriveFileId: fileId,
      mediaUrl,
      thumbnailUrl: mediaType === 'photo' ? mediaUrl : thumbnailUrl,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      caption,
      story,
      tags: tags ? tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean) : [],
      dateCaptured: new Date(dateCaptured),
      status,
      featuredLabel: finalFeaturedLabel,
    });

    if (status === 'approved' && place) {
      const countUpdate = { $inc: { memoryCount: 1 } };
      if (mediaType === 'photo') countUpdate.$inc.photoCount = 1;
      if (mediaType === 'video') countUpdate.$inc.videoCount = 1;
      await Place.findByIdAndUpdate(place._id, countUpdate);
    }

    return success(res, 201, status === 'approved' ? 'Memory uploaded and approved successfully!' : 'Memory submitted! It will be visible after admin review.', memory);
  } catch (err) {
    next(err);
  }
};

// GET /api/memories/:id
const getMemoryById = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id)
      .populate('uploader', 'name profileImage')
      .populate('place', 'name slug state district area');
    if (!memory) return error(res, 404, 'Memory not found.');

    let likedByMe = false;
    if (req.user) {
      likedByMe = !!(await Like.findOne({ user: req.user._id, memory: memory._id }));
    }

    return success(res, 200, 'Memory fetched.', { memory, likedByMe });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/memories/:id  (owner or admin)
const deleteMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return error(res, 404, 'Memory not found.');

    const isOwner = memory.uploader.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return error(res, 403, 'Not authorized to delete this memory.');

    // Try to delete from Google Drive first. 
    if (memory.googleDriveFileId) {
      await driveService.deleteFile(memory.googleDriveFileId);
    }
    
    await memory.deleteOne();

    // Decrement the place counters to keep them accurate
    if (memory.status === 'approved') {
      const countUpdate = { $inc: { memoryCount: -1 } };
      if (memory.mediaType === 'photo') countUpdate.$inc.photoCount = -1;
      if (memory.mediaType === 'video') countUpdate.$inc.videoCount = -1;
      await Place.findByIdAndUpdate(memory.place, countUpdate);
    }

    return success(res, 200, 'Memory deleted.');
  } catch (err) {
    next(err);
  }
};


// POST /api/memories/:id/like  (toggle)
const toggleLike = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return error(res, 404, 'Memory not found.');

    const existing = await Like.findOne({ user: req.user._id, memory: memory._id });
    if (existing) {
      await existing.deleteOne();
      memory.likeCount = Math.max(0, memory.likeCount - 1);
      await memory.save();
      return success(res, 200, 'Like removed.', { liked: false, likeCount: memory.likeCount });
    }

    await Like.create({ user: req.user._id, memory: memory._id });
    memory.likeCount += 1;
    await memory.save();

    if (memory.uploader.toString() !== req.user._id.toString()) {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: memory.uploader,
        type: 'memory_liked',
        message: `${req.user.name || 'Someone'} liked your memory.`,
        relatedMemory: memory._id,
      });
    }

    return success(res, 200, 'Memory liked.', { liked: true, likeCount: memory.likeCount });
  } catch (err) {
    next(err);
  }
};

// PUT /api/memories/:id  (owner or admin)
const updateMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return error(res, 404, 'Memory not found.');

    const isOwner = memory.uploader.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return error(res, 403, 'Not authorized to edit this memory.');

    const { caption, story, tags } = req.body;

    if (caption !== undefined) memory.caption = caption;
    if (story !== undefined) memory.story = story;
    if (tags !== undefined) {
      memory.tags = typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        : tags;
    }

    await memory.save();

    return success(res, 200, 'Memory updated.', memory);
  } catch (err) {
    next(err);
  }
};

// POST /api/memories/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return error(res, 400, 'Comment text is required.');

    const memory = await Memory.findById(req.params.id);
    if (!memory) return error(res, 404, 'Memory not found.');

    const Comment = require('../models/Comment');
    const comment = await Comment.create({
      user: req.user._id,
      memory: memory._id,
      text: text.trim(),
    });

    await comment.populate('user', 'name profileImage');

    if (memory.uploader.toString() !== req.user._id.toString()) {
      const Notification = require('../models/Notification');
      await Notification.create({
        user: memory.uploader,
        type: 'memory_commented',
        message: `${req.user.name || 'Someone'} commented on your memory.`,
        relatedMemory: memory._id,
      });
    }

    return success(res, 201, 'Comment added.', comment);
  } catch (err) {
    next(err);
  }
};

// GET /api/memories/:id/comments
const getComments = async (req, res, next) => {
  try {
    const Comment = require('../models/Comment');
    const comments = await Comment.find({ memory: req.params.id })
      .populate('user', 'name profileImage')
      .sort({ createdAt: 1 });

    return success(res, 200, 'Comments fetched.', comments);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/memories/comments/:commentId
const deleteComment = async (req, res, next) => {
  try {
    const Comment = require('../models/Comment');
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return error(res, 404, 'Comment not found.');

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return error(res, 403, 'Not authorized to delete this comment.');
    }

    await comment.deleteOne();
    return success(res, 200, 'Comment deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = { listMemories, getTimeline, uploadMemory, getMemoryById, updateMemory, deleteMemory, toggleLike, addComment, getComments, deleteComment };
