const User = require('../models/User');
const Place = require('../models/Place');
const Memory = require('../models/Memory');
const Report = require('../models/Report');
const { success, error } = require('../utils/apiResponse');

// GET /api/admin/overview
const getOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalPlaces,
      totalPhotos,
      totalVideos,
      pendingUploads,
      pendingSuggestions,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      Place.countDocuments({ status: 'approved' }),
      Memory.countDocuments({
        status: 'approved',
        mediaType: 'photo',
      }),
      Memory.countDocuments({
        status: 'approved',
        mediaType: 'video',
      }),
      Memory.countDocuments({ status: 'pending' }),
      require('../models/PlaceSuggestion').countDocuments({
        status: 'pending',
      }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    const storageAgg = await Memory.aggregate([
      {
        $group: {
          _id: null,
          totalBytes: { $sum: '$fileSize' },
        },
      },
    ]);

    const storageUsedBytes = storageAgg[0]?.totalBytes || 0;

    return success(res, 200, 'Overview fetched.', {
      totalUsers,
      totalPlaces,
      totalPhotos,
      totalVideos,
      pendingUploads,
      pendingSuggestions,
      pendingReports,
      storageUsedMB: Math.round(
        storageUsedBytes / (1024 * 1024)
      ),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/memories/pending
const getPendingMemories = async (req, res, next) => {
  try {
    const memories = await Memory.find({
      status: 'pending',
    })
      .populate('uploader', 'name email')
      .populate('place', 'name slug')
      .sort({ createdAt: 1 });

    return success(
      res,
      200,
      'Pending memories fetched.',
      memories
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/memories/:id/approve
const approveMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return error(res, 404, 'Memory not found.');
    }

    if (memory.status === 'approved') {
      return error(res, 400, 'Already approved.');
    }

    // Approve the memory
    memory.status = 'approved';
    await memory.save();

    // Find the place
    const place = await Place.findById(memory.place);

    if (place) {
      // Update total memory count
      place.memoryCount = (place.memoryCount || 0) + 1;

      if (memory.mediaType === 'photo') {
        // Update photo count
        place.photoCount = (place.photoCount || 0) + 1;

        /*
         * Automatically set the place cover image.
         *
         * If there is no cover image, the approved photo
         * becomes the cover image.
         */
        if (!place.coverImage) {
          place.coverImage =
            memory.thumbnailUrl || memory.mediaUrl || '';
        }
      } else if (memory.mediaType === 'video') {
        // Update video count
        place.videoCount = (place.videoCount || 0) + 1;
      }

      await place.save();
    }

    const Notification = require('../models/Notification');
    await Notification.create({
      user: memory.uploader,
      type: 'memory_approved',
      message: `Your memory at ${place?.name || 'a place'} has been approved!`,
      relatedMemory: memory._id,
      relatedPlace: place?._id,
    });

    return success(
      res,
      200,
      'Memory approved and is now public.',
      memory
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/memories/:id/reject
const rejectMemory = async (req, res, next) => {
  try {
    const { reason = '' } = req.body;

    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return error(res, 404, 'Memory not found.');
    }

    memory.status = 'rejected';
    memory.rejectionReason = reason;
    memory.rejectedAt = new Date();

    await memory.save();

    const Notification = require('../models/Notification');
    await Notification.create({
      user: memory.uploader,
      type: 'memory_rejected',
      message: `Your memory has been rejected. Reason: ${reason || 'Not specified'}`,
      relatedMemory: memory._id,
    });

    return success(
      res,
      200,
      'Memory rejected.',
      memory
    );
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/memories/:id/feature
const featureMemory = async (req, res, next) => {
  try {
    const { featuredLabel } = req.body;

    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return error(res, 404, 'Memory not found.');
    }

    memory.isFeatured = !!featuredLabel;
    memory.featuredLabel = featuredLabel || '';

    await memory.save();

    return success(
      res,
      200,
      'Memory feature status updated.',
      memory
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverview,
  getPendingMemories,
  approveMemory,
  rejectMemory,
  featureMemory,
};