/**
 * Migration: fix all drive.google.com URLs in both Memory and Place collections.
 * Run once from the server/ directory:
 *   node fixImageUrls.js
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');

const fixUrl = (url) => {
    if (!url) return url;
    // drive.google.com/thumbnail?id=XXX or uc?export=view&id=XXX
    const match = url.match(/[?&]id=([A-Za-z0-9_\-]+)/);
    if (match) return `https://lh3.googleusercontent.com/d/${match[1]}`;
    return url; // already lh3 or something else, keep it
};

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // ---- Fix Memory.mediaUrl & Memory.thumbnailUrl ----
    const Memory = mongoose.model(
        'Memory',
        new mongoose.Schema({ mediaUrl: String, thumbnailUrl: String }, { strict: false })
    );

    const memories = await Memory.find({
        $or: [
            { mediaUrl: /drive\.google\.com/ },
            { thumbnailUrl: /drive\.google\.com/ },
        ],
    });

    let memUpdated = 0;
    for (const mem of memories) {
        mem.mediaUrl = fixUrl(mem.mediaUrl);
        mem.thumbnailUrl = fixUrl(mem.thumbnailUrl);
        await mem.save();
        memUpdated++;
        console.log(`Memory updated: ${mem._id}`);
    }
    console.log(`Memories updated: ${memUpdated}`);

    // ---- Fix Place.coverImage ----
    const Place = mongoose.model(
        'Place',
        new mongoose.Schema({ coverImage: String }, { strict: false })
    );

    const places = await Place.find({ coverImage: /drive\.google\.com/ });

    let placeUpdated = 0;
    for (const pl of places) {
        pl.coverImage = fixUrl(pl.coverImage);
        await pl.save();
        placeUpdated++;
        console.log(`Place coverImage updated: ${pl._id}`);
    }
    console.log(`Places updated: ${placeUpdated}`);

    console.log('\nAll done!');
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
