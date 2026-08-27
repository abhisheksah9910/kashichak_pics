const express = require('express');
const router = express.Router();
const { getSettingByKey, updateFeaturedReel } = require('../controllers/settingController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { upload } = require('../middleware/upload');

// Public route
router.get('/:key', getSettingByKey);

// Admin route
router.put('/featured-reel', protect, adminOnly, upload.single('video'), updateFeaturedReel);

module.exports = router;
