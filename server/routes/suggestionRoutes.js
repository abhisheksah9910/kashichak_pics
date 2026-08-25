const express = require('express');
const {
  createSuggestion,
  listSuggestions,
  approveSuggestion,
  rejectSuggestion,
} = require('../controllers/suggestionController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

router.post('/', protect, createSuggestion);
router.get('/', protect, adminOnly, listSuggestions);
router.post('/:id/approve', protect, adminOnly, approveSuggestion);
router.post('/:id/reject', protect, adminOnly, rejectSuggestion);

module.exports = router;
