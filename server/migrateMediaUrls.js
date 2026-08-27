/**
 * Migration: Fix all broken proxy URLs (http://localhost:5000/api/media/...)
 * in Memory and Place collections.
 *
 * Run once from the server/ directory:
 *   node migrateMediaUrls.js
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.\n');

  // Use flexible schemas so we can query any collection without strict validation
  const Memory = mongoose.model(
    'Memory',
    new mongoose.Schema(
      {
        mediaUrl: String,
        thumbnailUrl: String,
        googleDriveFileId: String,
        mediaType: String,
        place: mongoose.Schema.Types.ObjectId,
        status: String,
      },
      { strict: false }
    )
  );

  const Place = mongoose.model(
    'Place',
    new mongoose.Schema({ coverImage: String, name: String }, { strict: false })
  );

  // ---- Fix Memory.mediaUrl & Memory.thumbnailUrl ----
  const memories = await Memory.find({});
  let memUpdated = 0;
  for (const mem of memories) {
    const fileId = mem.googleDriveFileId;
    if (!fileId) continue;

    let updated = false;
    if (mem.mediaUrl && !mem.mediaUrl.startsWith('/api/media/')) {
      mem.mediaUrl = `/api/media/${fileId}`;
      updated = true;
    }
    if (mem.thumbnailUrl && !mem.thumbnailUrl.startsWith('/api/media/')) {
      mem.thumbnailUrl = `/api/media/${fileId}`;
      updated = true;
    }

    if (updated) {
      await mem.save();
      memUpdated++;
      console.log(`  ✅ Memory ${mem._id} → /api/media/${fileId}`);
    }
  }
  console.log(`\nMemories updated: ${memUpdated}\n`);

  // ---- Fix Place.coverImage ----
  const places = await Place.find({});
  let placeUpdated = 0;
  for (const pl of places) {
    const firstPhoto = await Memory.findOne({ place: pl._id, status: 'approved' });
    if (firstPhoto && firstPhoto.googleDriveFileId) {
      const expectedUrl = `/api/media/${firstPhoto.googleDriveFileId}`;
      if (pl.coverImage !== expectedUrl) {
        pl.coverImage = expectedUrl;
        await pl.save();
        placeUpdated++;
        console.log(`  ✅ Place "${pl.name}" coverImage → ${expectedUrl}`);
      }
    }
  }
  console.log(`\nPlaces updated: ${placeUpdated}`);
  console.log('\nAll done! 🎉');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
