const express = require('express');
const { createReport, listReports, resolveReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

router.post('/', protect, createReport);
router.get('/', protect, adminOnly, listReports);
router.post('/:id/resolve', protect, adminOnly, resolveReport);

module.exports = router;
