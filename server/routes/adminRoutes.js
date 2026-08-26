const express = require('express');
const {
  getOverview,
  getPendingMemories,
  approveMemory,
  rejectMemory,
  featureMemory,
} = require('../controllers/adminController');
const { protect, adminOrModerator } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOrModerator);

router.get('/overview', getOverview);
router.get('/memories/pending', getPendingMemories);
router.post('/memories/:id/approve', approveMemory);
router.post('/memories/:id/reject', rejectMemory);
router.post('/memories/:id/feature', featureMemory);

module.exports = router;
