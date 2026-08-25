const PlaceSuggestion = require('../models/PlaceSuggestion');
const Place = require('../models/Place');
const { normalizeName, makeSlug } = require('../utils/slugify');
const { success, error } = require('../utils/apiResponse');

// POST /api/place-suggestions  (authenticated user suggests a new place)
const createSuggestion = async (req, res, next) => {
  try {
    const { name, state, district, area, description } = req.body;
    if (!name) return error(res, 400, 'Place name is required.');

    const normalizedName = normalizeName(name);
    const alreadyExists = await Place.findOne({ normalizedName });
    if (alreadyExists) return error(res, 409, 'This place already exists. Search for it instead.');

    const suggestion = await PlaceSuggestion.create({
      suggestedBy: req.user._id,
      name: name.trim(),
      locationHierarchy: { state, district, area },
      description,
    });

    return success(res, 201, 'Place suggested! An admin will review it shortly.', suggestion);
  } catch (err) {
    next(err);
  }
};

// GET /api/place-suggestions  (admin only)
const listSuggestions = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;
    const suggestions = await PlaceSuggestion.find({ status }).populate('suggestedBy', 'name email');
    return success(res, 200, 'Suggestions fetched.', suggestions);
  } catch (err) {
    next(err);
  }
};

// POST /api/place-suggestions/:id/approve  (admin only)
const approveSuggestion = async (req, res, next) => {
  try {
    const suggestion = await PlaceSuggestion.findById(req.params.id);
    if (!suggestion) return error(res, 404, 'Suggestion not found.');
    if (suggestion.status !== 'pending') return error(res, 400, 'Suggestion already reviewed.');

    const { state, district, area } = suggestion.locationHierarchy;
    const place = await Place.create({
      name: suggestion.name,
      slug: makeSlug(suggestion.name),
      normalizedName: normalizeName(suggestion.name),
      state,
      district,
      area,
      description: suggestion.description,
      status: 'approved',
      createdBy: suggestion.suggestedBy,
    });

    suggestion.status = 'approved';
    suggestion.reviewedBy = req.user._id;
    suggestion.createdPlace = place._id;
    await suggestion.save();

    return success(res, 200, 'Suggestion approved and place created.', { suggestion, place });
  } catch (err) {
    next(err);
  }
};

// POST /api/place-suggestions/:id/reject  (admin only)
const rejectSuggestion = async (req, res, next) => {
  try {
    const { reason = '' } = req.body;
    const suggestion = await PlaceSuggestion.findById(req.params.id);
    if (!suggestion) return error(res, 404, 'Suggestion not found.');

    suggestion.status = 'rejected';
    suggestion.rejectionReason = reason;
    suggestion.reviewedBy = req.user._id;
    await suggestion.save();

    return success(res, 200, 'Suggestion rejected.', suggestion);
  } catch (err) {
    next(err);
  }
};

module.exports = { createSuggestion, listSuggestions, approveSuggestion, rejectSuggestion };
