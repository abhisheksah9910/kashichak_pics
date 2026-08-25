const Report = require('../models/Report');
const Memory = require('../models/Memory');
const { success, error } = require('../utils/apiResponse');

// POST /api/reports  (authenticated)
const createReport = async (req, res, next) => {
  try {
    const { memoryId, reason, description } = req.body;
    if (!memoryId || !reason) return error(res, 400, 'memoryId and reason are required.');

    const memory = await Memory.findById(memoryId);
    if (!memory) return error(res, 404, 'Memory not found.');

    const report = await Report.create({
      reportedBy: req.user._id,
      memory: memoryId,
      reason,
      description,
    });

    memory.reportCount += 1;
    await memory.save();

    return success(res, 201, 'Thanks — this content has been reported to our moderators.', report);
  } catch (err) {
    next(err);
  }
};

// GET /api/reports  (admin only)
const listReports = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const reports = await Report.find({ status })
      .populate('reportedBy', 'name email')
      .populate({ path: 'memory', populate: { path: 'place', select: 'name slug' } });
    return success(res, 200, 'Reports fetched.', reports);
  } catch (err) {
    next(err);
  }
};

// POST /api/reports/:id/resolve  (admin only) { resolution: 'removed' | 'kept' | 'warned' }
const resolveReport = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    if (!['removed', 'kept', 'warned'].includes(resolution)) {
      return error(res, 400, 'resolution must be removed, kept, or warned.');
    }

    const report = await Report.findById(req.params.id);
    if (!report) return error(res, 404, 'Report not found.');

    if (resolution === 'removed') {
      await Memory.findByIdAndDelete(report.memory);
    }

    report.status = 'reviewed';
    report.resolution = resolution;
    await report.save();

    return success(res, 200, 'Report resolved.', report);
  } catch (err) {
    next(err);
  }
};

module.exports = { createReport, listReports, resolveReport };
