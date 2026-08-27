require('dotenv').config();
const { google } = require('googleapis');
const { getFileStream } = require('./services/googleDriveService');

async function test() {
  try {
    // Find a fileId in the DB
    const mongoose = require('mongoose');
    const Memory = require('./models/Memory');
    await mongoose.connect(process.env.MONGODB_URI);
    const video = await Memory.findOne({ mediaType: 'video' });
    
    console.log("Found video:", video.googleDriveFileId);
    
    // Get file stream with Range
    const driveClient = google.drive({
      version: 'v3',
      auth: new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      ).setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
    });

    const response = await driveClient.files.get(
      { fileId: video.googleDriveFileId, alt: 'media' },
      { responseType: 'stream', headers: { Range: 'bytes=0-100' } }
    );
    
    console.log("Status:", response.status);
    console.log("Headers:", response.headers);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
