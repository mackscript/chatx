import { ObjectId } from "mongodb";

export class Message {
  constructor(db) {
    this.collection = db.collection("messages");
  }

  async create(messageData) {
    const message = {
      ...messageData,
      timestamp: new Date(),
      _id: new ObjectId(),
      // Message status tracking
      status: {
        sent: true,
        delivered: false,
        read: false,
        deliveredAt: null,
        readAt: null,
        deliveredTo: [], // Array of user IDs who received the message
        readBy: [], // Array of user IDs who read the message
      },
      // Reply information (optional)
      replyTo: messageData.replyTo || null,
      // Message type and image data (optional)
      messageType: messageData.messageType || "text",
      imageData: messageData.imageData || null,
      // Reactions (emoji reactions to messages) - ALWAYS initialize as empty object
      reactions: messageData.reactions || {}, // Object where key is emoji and value is array of usernames
    };

    console.log("💾 Creating message with reactions field:", message.reactions);

    const result = await this.collection.insertOne(message);
    return { ...message, _id: result.insertedId };
  }

  async getAll(limit = 100, skip = 0) {
    return await this.collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  async getById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async deleteById(id) {
    return await this.collection.deleteOne({ _id: new ObjectId(id) });
  }

  async deleteExpiredMessages() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return await this.collection.deleteMany({
      timestamp: { $lt: twentyFourHoursAgo },
    });
  }

  // Mark message as delivered to a specific user
  async markAsDelivered(messageId, userId) {
    const result = await this.collection.updateOne(
      {
        _id: new ObjectId(messageId),
        "status.deliveredTo": { $ne: userId }, // Only add if not already in array
      },
      {
        $push: { "status.deliveredTo": userId },
        $set: {
          "status.delivered": true,
          "status.deliveredAt": new Date(),
        },
      },
    );
    return result;
  }

  // Mark message as read by a specific user
  async markAsRead(messageId, userId) {
    const result = await this.collection.updateOne(
      {
        _id: new ObjectId(messageId),
        "status.readBy": { $ne: userId }, // Only add if not already in array
      },
      {
        $push: { "status.readBy": userId },
        $set: {
          "status.read": true,
          "status.readAt": new Date(),
        },
      },
    );
    return result;
  }

  // Add or remove a reaction to a message (user can only remove their existing reaction, not change it)
  async toggleReaction(messageId, emoji, username) {
    try {
      const message = await this.getById(messageId);
      if (!message) return null;

      const reactions = message.reactions || {};
      const emojiUsers = reactions[emoji] || [];

      // Check if user already reacted with this emoji
      const userAlreadyReacted = emojiUsers.includes(username);

      // Check if user has any other reaction on this message
      const userHasOtherReaction = Object.keys(reactions).some(
        (existingEmoji) =>
          existingEmoji !== emoji && reactions[existingEmoji].includes(username)
      );

      if (userAlreadyReacted) {
        // Remove reaction (user can always remove their own reaction)
        const updatedUsers = emojiUsers.filter((user) => user !== username);
        if (updatedUsers.length === 0) {
          // Remove emoji key if no users left
          delete reactions[emoji];
        } else {
          reactions[emoji] = updatedUsers;
        }
        console.log(`➖ Removed reaction ${emoji} from user ${username}`);
      } else if (userHasOtherReaction) {
        // User already has a different reaction - don't allow changing
        console.log(`❌ User ${username} already has a reaction, cannot change to ${emoji}`);
        return {
          messageId,
          reactions,
          action: "blocked",
          emoji,
          username,
          error: "You can only remove your current reaction, not change it"
        };
      } else {
        // Add new reaction (user has no existing reaction)
        reactions[emoji] = [...(reactions[emoji] || []), username];
        console.log(`➕ Added reaction ${emoji} for user ${username}`);
      }

      // Update message in database
      await this.collection.updateOne(
        { _id: new ObjectId(messageId) },
        { $set: { reactions } },
      );

      return {
        messageId,
        reactions,
        action: userAlreadyReacted ? "removed" : "added",
        emoji,
        username,
      };
    } catch (error) {
      console.error("Error toggling reaction:", error);
      return null;
    }
  }

  // Get reactions for a message
  async getReactions(messageId) {
    const message = await this.getById(messageId);
    return message?.reactions || {};
  }

  // Get messages with their delivery/read status for a specific user
  async getMessagesWithStatus(room, userId, limit = 100, skip = 0) {
    // Filter messages to only include those from the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    console.log("🔍 getMessagesWithStatus called with:", {
      room,
      userId,
      limit,
      skip,
    });
    console.log("⏰ Looking for messages after:", twentyFourHoursAgo);

    // First, let's see what rooms exist in the database
    const allRooms = await this.collection.distinct("room");
    console.log("🏠 All rooms in database:", allRooms);
    console.log("🔍 Looking for room:", `"${room}"`);

    const messages = await this.collection
      .find({
        room,
        timestamp: { $gte: twentyFourHoursAgo }, // Only get messages from last 24 hours
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    console.log("📊 Raw messages found:", messages.length);
    if (messages.length > 0) {
      console.log("📝 Sample message:", {
        room: messages[0].room,
        user: messages[0].user,
        message: messages[0].message?.substring(0, 50),
        timestamp: messages[0].timestamp,
      });
    }

    // Add status information for each message and ensure reactions are preserved
    return messages.map((message) => ({
      ...message,
      isDeliveredToUser: message.status?.deliveredTo?.includes(userId) || false,
      isReadByUser: message.status?.readBy?.includes(userId) || false,
      deliveryCount: message.status?.deliveredTo?.length || 0,
      readCount: message.status?.readBy?.length || 0,
      reactions: message.reactions || {}, // Ensure reactions field is preserved
    }));
  }
}
