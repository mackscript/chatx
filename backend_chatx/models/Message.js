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
        readBy: [] // Array of user IDs who read the message
      },
      // Reply information (optional)
      replyTo: messageData.replyTo || null,
      // Message type and image data (optional)
      messageType: messageData.messageType || 'text',
      imageData: messageData.imageData || null
    };

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
        "status.deliveredTo": { $ne: userId } // Only add if not already in array
      },
      {
        $push: { "status.deliveredTo": userId },
        $set: { 
          "status.delivered": true,
          "status.deliveredAt": new Date()
        }
      }
    );
    return result;
  }

  // Mark message as read by a specific user
  async markAsRead(messageId, userId) {
    const result = await this.collection.updateOne(
      { 
        _id: new ObjectId(messageId),
        "status.readBy": { $ne: userId } // Only add if not already in array
      },
      {
        $push: { "status.readBy": userId },
        $set: { 
          "status.read": true,
          "status.readAt": new Date()
        }
      }
    );
    return result;
  }

  // Get messages with their delivery/read status for a specific user
  async getMessagesWithStatus(room, userId, limit = 100, skip = 0) {
    const messages = await this.collection
      .find({ room })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();

    // Add status information for each message
    return messages.map(message => ({
      ...message,
      isDeliveredToUser: message.status?.deliveredTo?.includes(userId) || false,
      isReadByUser: message.status?.readBy?.includes(userId) || false,
      deliveryCount: message.status?.deliveredTo?.length || 0,
      readCount: message.status?.readBy?.length || 0
    }));
  }
}
