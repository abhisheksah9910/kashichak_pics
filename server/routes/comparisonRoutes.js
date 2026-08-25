const express = require('express');
const { createComparison, listComparisons, approveComparison } = require('../controllers/comparisonController');
const { protect, adminOnly } = require('../middleware/auth');
const router = express.Router();

router.get('/', listComparisons);
router.post('/', protect, createComparison);
router.patch('/:id/approve', protect, adminOnly, approveComparison);

module.exports = router;
