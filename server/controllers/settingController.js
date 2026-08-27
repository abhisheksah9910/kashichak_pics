const Setting = require('../models/Setting');
const { uploadFile } = require('../services/googleDriveService');

// @desc    Get a setting by key
// @route   GET /api/settings/:key
// @access  Public
exports.getSettingByKey = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    
    if (!setting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    res.status(200).json({ success: true, data: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update featured reel
// @route   PUT /api/settings/featured-reel
// @access  Private/Admin
exports.updateFeaturedReel = async (req, res) => {
  try {
    const { instaUrl } = req.body;
    let videoData = null;

    if (req.file) {
      // Upload new video to Google Drive
      videoData = await uploadFile({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      });
    }

    const currentSetting = await Setting.findOne({ key: 'featured_reel' });
    
    let newValue = currentSetting ? { ...currentSetting.value } : {};
    if (instaUrl) newValue.instaUrl = instaUrl;
    if (videoData) {
      newValue.videoUrl = videoData.mediaUrl;
      newValue.thumbnailUrl = videoData.thumbnailUrl;
    }

    const updatedSetting = await Setting.findOneAndUpdate(
      { key: 'featured_reel' },
      { value: newValue },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: updatedSetting.value });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error while updating reel', stack: error.stack });
  }
};
