const express = require('express');
const {
  listMemories,
  getTimeline,
  uploadMemory,
  getMemoryById,
  updateMemory,
  deleteMemory,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
} = require('../controllers/memoryController');
const { protect, attachUserIfPresent } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const cacheMiddleware = require('../middleware/cacheMiddleware');

const router = express.Router();

router.get('/', attachUserIfPresent, cacheMiddleware(300), listMemories);
router.get('/timeline', attachUserIfPresent, cacheMiddleware(300), getTimeline);
router.get('/:id', attachUserIfPresent, cacheMiddleware(300), getMemoryById);
router.get('/:id/comments', cacheMiddleware(300), getComments);

router.post('/', protect, upload.single('media'), uploadMemory);
router.put('/:id', protect, updateMemory);
router.delete('/:id', protect, deleteMemory);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, addComment);
router.delete('/comments/:commentId', protect, deleteComment);

module.exports = router;
