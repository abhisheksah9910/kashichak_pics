const express = require('express');
const { getAds, createAd, updateAd, deleteAd } = require('../controllers/adController');
const { protect, attachUserIfPresent } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { upload } = require('../middleware/upload');
const cacheMiddleware = require('../middleware/cacheMiddleware');

const router = express.Router();

router.get('/', attachUserIfPresent, cacheMiddleware(60), getAds);
router.post('/', protect, adminOnly, upload.single('image'), createAd);
router.put('/:id', protect, adminOnly, updateAd);
router.delete('/:id', protect, adminOnly, deleteAd);

module.exports = router;
