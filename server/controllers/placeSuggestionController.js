const PlaceSuggestion = require('../models/PlaceSuggestion');

// POST /api/place-suggestions
async function suggestPlace(req, res, next) {
  try {
    const { name, state, district, area, parentPlace, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Place name is required.' });

    const suggestion = await PlaceSuggestion.create({
      suggestedBy: req.user._id,
      name,
      locationHierarchy: { country: 'India', state, district, area },
      parentPlace: parentPlace || null,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Thanks! Your place suggestion has been sent to the admin for review.',
      data: { suggestion },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/place-suggestions/mine
async function mySuggestions(req, res, next) {
  try {
    const suggestions = await PlaceSuggestion.find({ suggestedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { suggestions } });
  } catch (err) {
    next(err);
  }
}

module.exports = { suggestPlace, mySuggestions };
