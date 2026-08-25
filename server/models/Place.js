const mongoose = require('mongoose');

// Scalable hierarchy: Country -> State -> District -> Area -> specific Place.
// `parentPlace` lets a landmark ("Kashichak Railway Station") point at its
// parent area ("Kashichak") so nested navigation and breadcrumbs work for
// any depth without new schemas.
const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    normalizedName: { type: String, required: true, index: true },

    country: { type: String, default: 'India', trim: true },
    state: { type: String, trim: true, index: true },
    district: { type: String, trim: true, index: true },
    area: { type: String, trim: true, index: true },

    level: {
      type: String,
      enum: ['state', 'district', 'area', 'place'],
      default: 'place',
    },
    parentPlace: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', default: null },

    description: { type: String, default: '', maxlength: 2000 },
    coverImage: { type: String, default: '' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },

    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Denormalized counters, kept in sync when memories are approved/removed
    // so listing pages don't need an aggregation on every request.
    memoryCount: { type: Number, default: 0 },
    photoCount: { type: Number, default: 0 },
    videoCount: { type: Number, default: 0 },
    contributorCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent duplicate places within the same parent regardless of case.
placeSchema.index({ normalizedName: 1, parentPlace: 1 }, { unique: true });
placeSchema.index({ name: 'text', area: 'text', district: 'text', state: 'text' });

module.exports = mongoose.model('Place', placeSchema);
