const User = require('../models/User');
const Memory = require('../models/Memory');

// GET /api/users/profile
async function getProfile(req, res, next) {
  try {
    const [approved, pending, rejected, places] = await Promise.all([
      Memory.countDocuments({ uploader: req.user._id, status: 'approved' }),
      Memory.countDocuments({ uploader: req.user._id, status: 'pending' }),
      Memory.countDocuments({ uploader: req.user._id, status: 'rejected' }),
      Memory.distinct('place', { uploader: req.user._id, status: 'approved' }),
    ]);

    res.json({
      success: true,
      data: {
        user: req.user.toSafeObject(),
        stats: {
          totalUploads: approved + pending + rejected,
          approvedUploads: approved,
          pendingUploads: pending,
          rejectedUploads: rejected,
          placesContributed: places.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/profile
async function updateProfile(req, res, next) {
  try {
    const { name, bio, profileImage } = req.body;
    if (name) req.user.name = name;
    if (bio !== undefined) req.user.bio = bio;
    if (profileImage !== undefined) req.user.profileImage = profileImage;
    await req.user.save();
    res.json({ success: true, data: { user: req.user.toSafeObject() } });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/my-uploads?status=
async function myUploads(req, res, next) {
  try {
    const { status } = req.query;
    const filter = { uploader: req.user._id };
    if (status) filter.status = status;
    const memories = await Memory.find(filter).sort({ createdAt: -1 }).populate('place', 'name slug');
    res.json({ success: true, data: { memories } });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/:id
async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select('name profileImage bio createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [approved, places] = await Promise.all([
      Memory.countDocuments({ uploader: user._id, status: 'approved' }),
      Memory.distinct('place', { uploader: user._id, status: 'approved' }),
    ]);

    // Calculate total likes received
    const memories = await Memory.find({ uploader: user._id, status: 'approved' }).select('likeCount');
    const totalLikes = memories.reduce((sum, m) => sum + (m.likeCount || 0), 0);

    res.json({
      success: true,
      data: {
        user,
        stats: {
          approvedUploads: approved,
          placesContributed: places.length,
          totalLikes,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/leaderboard
async function getLeaderboard(req, res, next) {
  try {
    const leaderboard = await Memory.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: '$uploader',
          memoryCount: { $sum: 1 },
          totalLikes: { $sum: '$likeCount' },
        },
      },
      { $sort: { memoryCount: -1, totalLikes: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          memoryCount: 1,
          totalLikes: 1,
          'user.name': 1,
          'user.profileImage': 1,
        },
      },
    ]);

    res.json({ success: true, data: leaderboard });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile, myUploads, getUserById, getLeaderboard };
