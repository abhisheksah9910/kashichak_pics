const express = require('express');
const {
  getOverview,
  getPendingMemories,
  approveMemory,
  rejectMemory,
  featureMemory,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/overview', getOverview);
router.get('/memories/pending', getPendingMemories);
router.post('/memories/:id/approve', approveMemory);
router.post('/memories/:id/reject', rejectMemory);
router.post('/memories/:id/feature', featureMemory);

module.exports = router;
