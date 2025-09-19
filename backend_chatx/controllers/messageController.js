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
    const { limit = 50, skip = 0, room, userId } = req.query;

    // Debug logging
    console.log('📥 getAllMessages called with:', { limit, skip, room, userId });

    // Convert query params to numbers
    const limitNum = parseInt(limit);
    const skipNum = parseInt(skip);

    let messages;
    
    if (room) {
      console.log('🔍 Fetching messages for room:', room);
      
      if (userId) {
        console.log('👤 Including user status for userId:', userId);
        // Use the method that includes status information for specific user
        messages = await this.messageModel.getMessagesWithStatus(room, userId, limitNum, skipNum);
      } else {
        console.log('📋 Fetching all messages for room without user-specific status');
        // Get messages by room only with 24-hour filter
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const filter = { 
          room: room,
          timestamp: { $gte: twentyFourHoursAgo } 
        };

        const rawMessages = await this.messageModel.collection
          .find(filter)
          .sort({ timestamp: -1 })
          .limit(limitNum)
          .skip(skipNum)
          .toArray();

        // Ensure all messages have a status field and preserve reactions
        messages = rawMessages.map(msg => ({
          ...msg,
          status: msg.status || {
            sent: true,
            delivered: false,
            read: false,
            deliveredAt: null,
            readAt: null,
            deliveredTo: [],
            readBy: []
          },
          reactions: msg.reactions || {} // Ensure reactions field is preserved
        }));
      }
      console.log('📊 Found messages:', messages.length);
      console.log('🎭 Messages with reactions:', messages.filter(m => m.reactions && Object.keys(m.reactions).length > 0).map(m => ({ id: m._id, reactions: m.reactions })));
    } else {
      console.log('❌ No room specified, returning empty array');
      messages = [];
    }

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
