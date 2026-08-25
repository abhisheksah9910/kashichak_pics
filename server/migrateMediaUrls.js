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
  const memories = await Memory.find({
    $or: [
      { mediaUrl: /localhost/ },
      { thumbnailUrl: /localhost/ },
    ],
  });

  console.log(`Found ${memories.length} memories with localhost proxy URLs.`);

  let memUpdated = 0;
  for (const mem of memories) {
    const fileId = mem.googleDriveFileId;
    if (!fileId) {
      console.warn(`  Skipping memory ${mem._id} — no googleDriveFileId`);
      continue;
    }

    if (mem.mediaType === 'photo') {
      // Photos: use lh3.googleusercontent.com (public CDN, no proxy needed)
      mem.mediaUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
      mem.thumbnailUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    }
    // Videos: keep proxy URL but ensure correct format
    // (proxy is still needed for video streaming)

    await mem.save();
    memUpdated++;
    console.log(`  ✅ Memory ${mem._id} (${mem.mediaType}) → ${mem.mediaUrl}`);
  }

  console.log(`\nMemories updated: ${memUpdated}\n`);

  // ---- Fix Place.coverImage ----
  const places = await Place.find({ coverImage: /localhost/ });
  console.log(`Found ${places.length} places with localhost coverImage.`);

  let placeUpdated = 0;
  for (const pl of places) {
    // Find the first approved photo for this place and use its lh3 URL
    const firstPhoto = await Memory.findOne({
      place: pl._id,
      status: 'approved',
      mediaType: 'photo',
    });

    if (firstPhoto && firstPhoto.googleDriveFileId) {
      pl.coverImage = `https://lh3.googleusercontent.com/d/${firstPhoto.googleDriveFileId}`;
      await pl.save();
      placeUpdated++;
      console.log(`  ✅ Place "${pl.name}" coverImage → ${pl.coverImage}`);
    } else {
      console.warn(`  ⚠️  Place "${pl.name}" — no approved photo found, skipping`);
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
