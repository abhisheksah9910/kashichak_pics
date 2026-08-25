/**
 * Google Drive storage service.
 *
 * This file handles all Google Drive operations:
 * - Upload files
 * - Make uploaded files publicly viewable
 * - Generate display URLs and thumbnail URLs
 * - Delete files
 * - Stream files
 */

const { google } = require('googleapis');
const { Readable } = require('stream');

let driveClient = null;

/**
 * Create and return the Google Drive client.
 */
function getDriveClient() {
  if (driveClient) return driveClient;

  const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
    'GOOGLE_DRIVE_FOLDER_ID',
  ];

  const missing = requiredVars.filter(
    (variable) =>
      !process.env[variable] ||
      process.env[variable].startsWith('your_')
  );

  if (missing.length) {
    throw new Error(
      `Google Drive is not configured. Add these to server/.env: ${missing.join(', ')}`
    );
  }

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  driveClient = google.drive({
    version: 'v3',
    auth: oAuth2Client,
  });

  return driveClient;
}

/**
 * Upload a file to Google Drive.
 *
 * The original file is uploaded without compression.
 *
 * @param {Object} fileData
 * @param {Buffer} fileData.buffer
 * @param {string} fileData.originalName
 * @param {string} fileData.mimeType
 *
 * @returns {Promise<{
 *   fileId: string,
 *   mediaUrl: string,
 *   thumbnailUrl: string
 * }>}
 */
async function uploadFile({ buffer, originalName, mimeType }) {
  const drive = getDriveClient();

  const fileMetadata = {
    name: `${Date.now()}-${originalName}`,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
  };

  const media = {
    mimeType,
    body: Readable.from(buffer),
  };

  // Upload file
  const file = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id',
  });

  const fileId = file.data.id;

  // Make file publicly accessible.
  // This means every newly uploaded image/video can be viewed
  // directly from the website without manually changing permissions.
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  /**
   * For images: use lh3.googleusercontent.com/d/{fileId} — Google's public CDN.
   *   Files are already made public above, so this URL works directly in the browser
   *   without any proxy, authentication, or CORS issues.
   * For videos: stream through our proxy (GET /api/media/:fileId) because the lh3
   *   CDN only serves image formats.
   */
  const isImage = mimeType.startsWith('image/');
  const serverBase = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;

  const mediaUrl = isImage
    ? `https://lh3.googleusercontent.com/d/${fileId}`
    : `${serverBase}/api/media/${fileId}`;

  const thumbnailUrl = isImage
    ? `https://lh3.googleusercontent.com/d/${fileId}`
    : `${serverBase}/api/media/${fileId}`;

  return {
    fileId,
    mediaUrl,
    thumbnailUrl,
  };
}

/**
 * Delete a file from Google Drive.
 */
async function deleteFile(fileId) {
  const drive = getDriveClient();

  await drive.files.delete({
    fileId,
  });
}

/**
 * Get a readable stream for a Google Drive file.
 * Useful for streaming videos or files through the backend.
 */
async function getFileStream(fileId) {
  const drive = getDriveClient();

  const response = await drive.files.get(
    {
      fileId,
      alt: 'media',
    },
    {
      responseType: 'stream',
    }
  );

  return response.data;
}

module.exports = {
  uploadFile,
  deleteFile,
  getFileStream,
};