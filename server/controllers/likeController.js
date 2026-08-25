const Like = require('../models/Like');
const Memory = require('../models/Memory');

// POST /api/memories/:id/like  (toggle)
async function toggleLike(req, res, next) {
  try {
    const memoryId = req.params.id;
    const existing = await Like.findOne({ user: req.user._id, memory: memoryId });

    let liked;
    if (existing) {
      await existing.deleteOne();
      await Memory.findByIdAndUpdate(memoryId, { $inc: { likeCount: -1 } });
      liked = false;
    } else {
      await Like.create({ user: req.user._id, memory: memoryId });
      await Memory.findByIdAndUpdate(memoryId, { $inc: { likeCount: 1 } });
      liked = true;
    }

    const memory = await Memory.findById(memoryId).select('likeCount');
    res.json({ success: true, data: { liked, likeCount: memory.likeCount } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Already liked.' });
    }
    next(err);
  }
}

module.exports = { toggleLike };
