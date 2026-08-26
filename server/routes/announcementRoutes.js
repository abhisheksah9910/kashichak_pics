const express = require('express');
const { getAnnouncement, updateAnnouncement } = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const cacheMiddleware = require('../middleware/cacheMiddleware');

const router = express.Router();

router.get('/', cacheMiddleware(60), getAnnouncement);
router.put('/', protect, adminOnly, updateAnnouncement);

module.exports = router;
