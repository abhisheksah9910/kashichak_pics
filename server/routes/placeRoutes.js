const express = require('express');
const {
  listPlaces,
  searchSuggestions,
  getPlaceBySlug,
  createPlace,
  updatePlace,
  deletePlace,
  mergePlaces,
} = require('../controllers/placeController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

router.get('/', listPlaces);
router.get('/search-suggestions', searchSuggestions);
router.get('/:slug', getPlaceBySlug);

router.post('/', protect, adminOnly, createPlace);
router.post('/merge', protect, adminOnly, mergePlaces);
router.put('/:id', protect, adminOnly, updatePlace);
router.delete('/:id', protect, adminOnly, deletePlace);

module.exports = router;
