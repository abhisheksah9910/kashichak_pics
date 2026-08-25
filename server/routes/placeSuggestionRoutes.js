const express = require('express');
const { suggestPlace, mySuggestions } = require('../controllers/placeSuggestionController');
const { createSuggestion, listSuggestions, approveSuggestion, rejectSuggestion } = require('../controllers/suggestionController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const router = express.Router();

// User routes (must be logged in)
router.use(protect);
router.post('/', suggestPlace);
router.get('/mine', mySuggestions);

// Admin routes
router.get('/', adminOnly, listSuggestions);
router.post('/:id/approve', adminOnly, approveSuggestion);
router.post('/:id/reject', adminOnly, rejectSuggestion);

module.exports = router;
