const mongoose = require('mongoose');

const placeSuggestionSchema = new mongoose.Schema(
  {
    suggestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    locationHierarchy: {
      country: { type: String, default: 'India' },
      state: String,
      district: String,
      area: String,
    },
    description: { type: String, default: '', maxlength: 1000 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, default: '' },
    createdPlace: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlaceSuggestion', placeSuggestionSchema);
