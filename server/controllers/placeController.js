const Place = require('../models/Place');
const Memory = require('../models/Memory');

const { normalizeName, makeSlug } = require('../utils/slugify');
const { success, error } = require('../utils/apiResponse');


// ==========================================
// HELPER: CREATE FULL IMAGE URL
// ==========================================
const getFullMediaUrl = (req, url) => {
  if (!url) return '';

  // Already a full URL
  if (
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }

  // Convert relative URL to full backend URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};


// ==========================================
// HELPER: FORMAT PLACE
// ==========================================
const formatPlace = (req, place) => {
  const data = place.toObject
    ? place.toObject()
    : { ...place };

  if (data.coverImage) {
    data.coverImage = getFullMediaUrl(
      req,
      data.coverImage
    );
  }

  return data;
};


// ==========================================
// GET ALL PLACES
// GET /api/places
// ==========================================
const listPlaces = async (req, res, next) => {
  try {
    const {
      q,
      state,
      district,
      area,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {
      status: 'approved',
    };

    if (state) {
      filter.state = state;
    }

    if (district) {
      filter.district = district;
    }

    if (area) {
      filter.area = area;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { area: { $regex: q.trim(), $options: 'i' } },
        { district: { $regex: q.trim(), $options: 'i' } },
        { state: { $regex: q.trim(), $options: 'i' } },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      most_memories: { memoryCount: -1 },
      alphabetical: { name: 1 },
    };

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);

    const skip =
      (pageNumber - 1) * limitNumber;

    const [places, total] = await Promise.all([
      Place.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(limitNumber),

      Place.countDocuments(filter),
    ]);

    const formattedPlaces = places.map((place) =>
      formatPlace(req, place)
    );

    return success(
      res,
      200,
      'Places fetched.',
      formattedPlaces,
      {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
      }
    );
  } catch (err) {
    next(err);
  }
};


// ==========================================
// SEARCH SUGGESTIONS
// GET /api/places/search-suggestions?q=kashi
// ==========================================
const searchSuggestions = async (
  req,
  res,
  next
) => {
  try {
    const { q = '' } = req.query;

    if (!q.trim()) {
      return success(
        res,
        200,
        'Suggestions fetched.',
        []
      );
    }

    const places = await Place.find({
      status: 'approved',
      name: {
        $regex: q.trim(),
        $options: 'i',
      },
    })
      .select(
        'name slug state district area coverImage'
      )
      .limit(8);

    const formattedPlaces = places.map((place) =>
      formatPlace(req, place)
    );

    return success(
      res,
      200,
      'Suggestions fetched.',
      formattedPlaces
    );
  } catch (err) {
    next(err);
  }
};


// ==========================================
// GET SINGLE PLACE
// GET /api/places/:slug
// ==========================================
const getPlaceBySlug = async (
  req,
  res,
  next
) => {
  try {
    const place = await Place.findOne({
      slug: req.params.slug,
      status: 'approved',
    });

    if (!place) {
      return error(
        res,
        404,
        'Place not found.'
      );
    }

    const yearsAgg = await Memory.aggregate([
      {
        $match: {
          place: place._id,
          status: 'approved',
        },
      },
      {
        $group: {
          _id: {
            $year: '$dateCaptured',
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    return success(
      res,
      200,
      'Place fetched.',
      {
        place: formatPlace(req, place),

        yearsCovered: yearsAgg.map(
          (item) => item._id
        ),
      }
    );
  } catch (err) {
    next(err);
  }
};


// ==========================================
// CREATE PLACE
// POST /api/places
// ADMIN ONLY
// ==========================================
const createPlace = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      state,
      district,
      area,
      parentPlace,
      level,
      description,
      coverImage,
      coordinates,
    } = req.body;

    if (!name) {
      return error(
        res,
        400,
        'Place name is required.'
      );
    }

    const normalizedName =
      normalizeName(name);

    const duplicate =
      await Place.findOne({
        normalizedName,
        parentPlace: parentPlace || null,
      });

    if (duplicate) {
      return error(
        res,
        409,
        'A place with this name already exists at this level.'
      );
    }

    let parentSlug = '';

    if (parentPlace) {
      const parent =
        await Place.findById(parentPlace);

      if (parent) {
        parentSlug = parent.slug;
      }
    }

    const place = await Place.create({
      name: name.trim(),

      slug: makeSlug(
        name,
        parentSlug
      ),

      normalizedName,

      state,
      district,
      area,

      parentPlace:
        parentPlace || null,

      level:
        level || 'place',

      description,

      // Store relative path in DB
      // Backend automatically converts it
      coverImage,
      coordinates,

      status: 'approved',

      createdBy: req.user._id,
    });

    return success(
      res,
      201,
      'Place created.',
      formatPlace(req, place)
    );
  } catch (err) {
    next(err);
  }
};


// ==========================================
// UPDATE PLACE
// PUT /api/places/:id
// ADMIN ONLY
// ==========================================
const updatePlace = async (
  req,
  res,
  next
) => {
  try {
    const allowedFields = [
      'name',
      'state',
      'district',
      'area',
      'description',
      'coverImage',
      'coordinates',
      'status',
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (
        req.body[field] !== undefined
      ) {
        updates[field] =
          req.body[field];
      }
    });

    if (updates.name) {
      updates.name =
        updates.name.trim();

      updates.normalizedName =
        normalizeName(
          updates.name
        );
    }

    const place =
      await Place.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!place) {
      return error(
        res,
        404,
        'Place not found.'
      );
    }

    return success(
      res,
      200,
      'Place updated.',
      formatPlace(req, place)
    );
  } catch (err) {
    next(err);
  }
};


// ==========================================
// DELETE PLACE
// DELETE /api/places/:id
// ADMIN ONLY
// ==========================================
const deletePlace = async (
  req,
  res,
  next
) => {
  try {
    const place =
      await Place.findById(
        req.params.id
      );

    if (!place) {
      return error(
        res,
        404,
        'Place not found.'
      );
    }
    
    // Find all memories associated with this place
    const memories = await Memory.find({ place: place._id });
    
    // Delete all associated files from Google Drive
    const driveService = require('../services/googleDriveService');
    for (const memory of memories) {
      if (memory.googleDriveFileId) {
        try {
          await driveService.deleteFile(memory.googleDriveFileId);
        } catch (driveErr) {
          console.warn(`Failed to delete file ${memory.googleDriveFileId} from Drive:`, driveErr.message);
        }
      }
    }
    
    // Delete all memories from database
    await Memory.deleteMany({ place: place._id });
    
    // Delete the place
    await place.deleteOne();

    return success(
      res,
      200,
      'Place deleted.'
    );
  } catch (err) {
    next(err);
  }
};


// ==========================================
// MERGE PLACES
// POST /api/places/merge
// ADMIN ONLY
// ==========================================
const mergePlaces = async (
  req,
  res,
  next
) => {
  try {
    const {
      sourceId,
      targetId,
    } = req.body;

    if (
      !sourceId ||
      !targetId
    ) {
      return error(
        res,
        400,
        'sourceId and targetId are required.'
      );
    }

    if (
      sourceId === targetId
    ) {
      return error(
        res,
        400,
        'Cannot merge a place into itself.'
      );
    }

    const [
      source,
      target,
    ] = await Promise.all([
      Place.findById(sourceId),
      Place.findById(targetId),
    ]);

    if (
      !source ||
      !target
    ) {
      return error(
        res,
        404,
        'One or both places not found.'
      );
    }

    await Memory.updateMany(
      {
        place: source._id,
      },
      {
        place: target._id,
      }
    );

    await Place.findByIdAndUpdate(
      target._id,
      {
        $inc: {
          memoryCount:
            source.memoryCount || 0,

          photoCount:
            source.photoCount || 0,

          videoCount:
            source.videoCount || 0,
        },
      }
    );

    await Place.findByIdAndDelete(
      source._id
    );

    return success(
      res,
      200,
      'Places merged successfully.'
    );
  } catch (err) {
    next(err);
  }
};


// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  listPlaces,
  searchSuggestions,
  getPlaceBySlug,
  createPlace,
  updatePlace,
  deletePlace,
  mergePlaces,
};