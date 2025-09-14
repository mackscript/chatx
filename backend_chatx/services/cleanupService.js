import { Message } from "../models/Message.js";

export class CleanupService {
  constructor(db) {
    this.messageModel = new Message(db);
    this.isRunning = false;
  }

  async cleanupExpiredMessages() {
    try {
      console.log("🧹 Starting cleanup of expired messages...");
      const result = await this.messageModel.deleteExpiredMessages();

      if (result.deletedCount > 0) {
        console.log(
          `✅ Deleted ${result.deletedCount} expired messages (older than 24 hours)`,
        );
      } else {
        console.log("ℹ️ No expired messages found to delete");
      }

      return result;
    } catch (error) {
      console.error("❌ Error during message cleanup:", error);
      throw error;
    }
  }

  startScheduledCleanup(intervalMinutes = 60) {
    if (this.isRunning) {
      console.log("⚠️ Cleanup service is already running");
      return;
    }

    this.isRunning = true;
    console.log(
      `🕒 Starting scheduled cleanup every ${intervalMinutes} minutes`,
    );

    // Run cleanup immediately on start
    this.cleanupExpiredMessages().catch(console.error);

    // Schedule recurring cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredMessages().catch(console.error);
    }, intervalMinutes * 60 * 1000);
  }

  stopScheduledCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.isRunning = false;
      console.log("🛑 Scheduled cleanup stopped");
    }
  }
}
