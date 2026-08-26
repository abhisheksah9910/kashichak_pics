const cron = require('node-cron');
const Memory = require('../models/Memory');
const driveService = require('../services/googleDriveService');

// Run every day at midnight (0 0 * * *)
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily cleanup job...');
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find all rejected memories where rejectedAt is older than 30 days
    const oldMemories = await Memory.find({
      status: 'rejected',
      rejectedAt: { $lte: thirtyDaysAgo }
    });

    if (oldMemories.length === 0) {
      console.log('No old rejected memories to clean up.');
      return;
    }

    let deletedCount = 0;
    for (const memory of oldMemories) {
      try {
        if (memory.googleDriveFileId) {
          await driveService.deleteFile(memory.googleDriveFileId);
        }
        await memory.deleteOne();
        deletedCount++;
      } catch (err) {
        console.error(`Failed to delete memory ${memory._id}:`, err);
      }
    }

    console.log(`Cleanup complete. Deleted ${deletedCount} memories.`);
  } catch (error) {
    console.error('Error during cleanup job:', error);
  }
});
