const BeforeNowComparison = require('../models/BeforeNowComparison');

// POST /api/comparisons
async function createComparison(req, res, next) {
  try {
    const { placeId, beforeMemoryId, nowMemoryId, title } = req.body;
    if (!placeId || !beforeMemoryId || !nowMemoryId) {
      return res.status(400).json({ success: false, message: 'placeId, beforeMemoryId, and nowMemoryId are required.' });
    }

    const comparison = await BeforeNowComparison.create({
      place: placeId,
      beforeMemory: beforeMemoryId,
      nowMemory: nowMemoryId,
      title,
      createdBy: req.user._id,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: { comparison } });
  } catch (err) {
    next(err);
  }
}

// GET /api/comparisons?place=
async function listComparisons(req, res, next) {
  try {
    const { place } = req.query;
    const filter = { status: 'approved' };
    if (place) filter.place = place;

    const comparisons = await BeforeNowComparison.find(filter)
      .populate('beforeMemory')
      .populate('nowMemory')
      .populate('place', 'name slug')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { comparisons } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/comparisons/:id/approve  (admin)
async function approveComparison(req, res, next) {
  try {
    const comparison = await BeforeNowComparison.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!comparison) return res.status(404).json({ success: false, message: 'Comparison not found.' });
    res.json({ success: true, data: { comparison } });
  } catch (err) {
    next(err);
  }
}

module.exports = { createComparison, listComparisons, approveComparison };
