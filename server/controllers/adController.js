const Ad = require('../models/Ad');
const driveService = require('../services/googleDriveService');
const sharp = require('sharp');
const { success, error } = require('../utils/apiResponse');
const { ALLOWED_IMAGE_TYPES, MAX_IMAGE_MB } = require('../middleware/upload');

// GET /api/ads
// Fetch ads (Admin sees all, public sees active)
const getAds = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const filter = isAdmin ? {} : { isActive: true };
    const ads = await Ad.find(filter).sort({ createdAt: -1 });
    return success(res, 200, 'Ads fetched successfully', ads);
  } catch (err) {
    next(err);
  }
};

// POST /api/ads
// Create a new Ad (Admin only)
const createAd = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 400, 'Ad image is required.');
    
    const { caption, link, slot } = req.body;
    if (!caption) return error(res, 400, 'Caption is required.');

    if (!ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
      return error(res, 400, 'Only images are allowed for ads.');
    }

    const maxBytes = MAX_IMAGE_MB * 1024 * 1024;
    if (req.file.size > maxBytes) {
      return error(res, 400, `Image too large. Max size is ${MAX_IMAGE_MB}MB.`);
    }

    let finalBuffer = req.file.buffer;
    let finalMimeType = req.file.mimetype;
    let finalOriginalName = req.file.originalname;

    try {
      finalBuffer = await sharp(req.file.buffer)
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      finalMimeType = 'image/webp';
      finalOriginalName = finalOriginalName.replace(/\.[^/.]+$/, "") + ".webp";
    } catch (err) {
      console.error("Error compressing ad image:", err);
    }

    // Upload to Google Drive
    const { fileId, mediaUrl } = await driveService.uploadFile({
      buffer: finalBuffer,
      originalName: finalOriginalName,
      mimeType: finalMimeType,
    });

    const ad = await Ad.create({
      imageUrl: mediaUrl,
      googleDriveFileId: fileId,
      caption,
      link: link || '',
      slot: slot || 'general',
      isActive: true,
    });

    return success(res, 201, 'Ad created successfully', ad);
  } catch (err) {
    next(err);
  }
};

// PUT /api/ads/:id
// Toggle active status (Admin only)
const updateAd = async (req, res, next) => {
  try {
    const { isActive, caption, link } = req.body;
    const ad = await Ad.findById(req.params.id);
    if (!ad) return error(res, 404, 'Ad not found');

    if (isActive !== undefined) ad.isActive = isActive;
    if (caption !== undefined) ad.caption = caption;
    if (link !== undefined) ad.link = link;

    await ad.save();
    return success(res, 200, 'Ad updated successfully', ad);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/ads/:id
// Delete ad and its image (Admin only)
const deleteAd = async (req, res, next) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return error(res, 404, 'Ad not found');

    if (ad.googleDriveFileId) {
      await driveService.deleteFile(ad.googleDriveFileId);
    }

    await ad.deleteOne();
    return success(res, 200, 'Ad deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAds, createAd, updateAd, deleteAd };
