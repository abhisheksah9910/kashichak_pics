const Announcement = require('../models/Announcement');
const { success, error } = require('../utils/apiResponse');

// GET /api/announcement
// Public route to get the global announcement
const getAnnouncement = async (req, res, next) => {
  try {
    // We only ever need one announcement document for the site
    let announcement = await Announcement.findOne();
    if (!announcement) {
      // Create a default one if it doesn't exist
      announcement = await Announcement.create({
        message: 'Welcome to Kashichak!',
        isActive: false
      });
    }
    return success(res, 200, 'Announcement fetched', announcement);
  } catch (err) {
    next(err);
  }
};

// PUT /api/announcement
// Admin route to update the global announcement
const updateAnnouncement = async (req, res, next) => {
  try {
    const { message, isActive, backgroundColor, link } = req.body;
    
    let announcement = await Announcement.findOne();
    if (!announcement) {
      announcement = new Announcement();
    }

    if (message !== undefined) announcement.message = message;
    if (isActive !== undefined) announcement.isActive = isActive;
    if (backgroundColor !== undefined) announcement.backgroundColor = backgroundColor;
    if (link !== undefined) announcement.link = link;

    await announcement.save();

    return success(res, 200, 'Announcement updated', announcement);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnnouncement, updateAnnouncement };
