const express = require('express');
const { getProfile, updateProfile, myUploads, getUserById, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/public/:id', getUserById);

router.use(protect);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.get('/my-uploads', myUploads);

module.exports = router;
