const multer = require('multer');

const MAX_IMAGE_MB = Number(process.env.MAX_IMAGE_SIZE_MB || 15);
const MAX_VIDEO_MB = Number(process.env.MAX_VIDEO_SIZE_MB || 200);

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error('Unsupported file type. Please upload a JPG, PNG, WEBP image or MP4, MOV, WEBM video.'));
};

// Cap at the larger of the two limits here; per-type size is re-validated
// in the controller once we know if it's an image or a video.
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Math.max(MAX_IMAGE_MB, MAX_VIDEO_MB) * 1024 * 1024 },
});

module.exports = { upload, MAX_IMAGE_MB, MAX_VIDEO_MB, ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES };
