import { Message } from '../models/Message.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export class MessageController {
  constructor(db) {
    this.messageModel = new Message(db);
  }

  // POST /api/messages - Send a new message
  sendMessage = asyncHandler(async (req, res) => {
    const { message, user, room } = req.validatedData;

    const newMessage = await this.messageModel.create({
      message,
      user,
      room: room || 'general'
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  });

  // GET /api/messages - Get all messages
  getAllMessages = asyncHandler(async (req, res) => {
    const { limit = 50, skip = 0, room } = req.query;

    // Convert query params to numbers
    const limitNum = parseInt(limit);
    const skipNum = parseInt(skip);

    // Filter out messages older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const filter = { timestamp: { $gte: twentyFourHoursAgo } };
    
    if (room) {
      filter.room = room;
    }

    const messages = await this.messageModel.collection
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .skip(skipNum)
      .toArray();

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: messages,
      count: messages.length
    });
  });

  // GET /api/messages/:id - Get message by ID
  getMessageById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const message = await this.messageModel.getById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message retrieved successfully',
      data: message
    });
  });

  // DELETE /api/messages/:id - Delete message by ID
  deleteMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await this.messageModel.deleteById(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  });

  // POST /api/messages/cleanup - Manual cleanup of expired messages
  cleanupExpiredMessages = asyncHandler(async (req, res) => {
    const result = await this.messageModel.deleteExpiredMessages();

    res.status(200).json({
      success: true,
      message: `Cleanup completed. ${result.deletedCount} expired messages deleted.`,
      deletedCount: result.deletedCount
    });
  });
}
