import { Message } from '../models/Message.js';

export const setupSocketHandlers = (io, db) => {
  const messageModel = new Message(db);
  
  // Track online users per room
  const roomUsers = new Map(); // room -> Set of {socketId, username}

  const updateRoomUsers = (room) => {
    if (!room) return;
    
    const users = roomUsers.get(room) || new Set();
    const userList = Array.from(users).map(user => ({
      socketId: user.socketId,
      username: user.username
    }));
    
    // Emit updated user list to all users in the room
    io.to(room).emit('room_users_updated', {
      users: userList,
      count: userList.length
    });
  };

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join a room
    socket.on('join_room', (data) => {
      const { room, username } = data;
      socket.join(room);
      socket.room = room;
      socket.username = username;
      
      // Add user to room tracking
      if (!roomUsers.has(room)) {
        roomUsers.set(room, new Set());
      }
      roomUsers.get(room).add({ socketId: socket.id, username });
      
      console.log(`👤 User ${username} (${socket.id}) joined room: ${room}`);
      
      // Update room users list
      updateRoomUsers(room);
      
      // Notify others in the room
      socket.to(room).emit('user_joined', {
        message: `${username} joined the room`,
        timestamp: new Date(),
        type: 'system'
      });
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        console.log('🔄 Backend received message data:', {
          user: data.user,
          room: data.room,
          messageType: data.messageType,
          hasImageData: !!data.imageData,
          imageDataSize: data.imageData ? (data.imageData.length / (1024 * 1024)).toFixed(2) + 'MB' : 'N/A',
          hasReply: !!data.replyTo
        });
        const { message, user, room = 'general', replyTo, messageType, imageData } = data;

        // Validate data
        if (!user) {
          socket.emit('error', { message: 'User is required' });
          return;
        }

        // For text messages, message is required
        if (messageType !== 'image' && !message) {
          socket.emit('error', { message: 'Message text is required' });
          return;
        }

        // Debug logging for image messages
        if (messageType === 'image') {
          console.log('🖼️ Processing image message:', {
            user,
            room,
            messageType,
            captionLength: message ? message.length : 0,
            hasImageData: !!imageData,
            imageDataSize: imageData ? (imageData.length / (1024 * 1024)).toFixed(2) + 'MB' : 'N/A'
          });
        }

        // For image messages, imageData is required
        if (messageType === 'image' && !imageData) {
          socket.emit('error', { message: 'Image data is required' });
          return;
        }

        // Check image data size (Base64 encoded images are ~33% larger than original)
        // Reduced limit to 2MB Base64 for better socket stability
        if (imageData && imageData.length > 2 * 1024 * 1024) { // 2MB Base64 limit to prevent disconnects
          console.log(`❌ Image too large: ${(imageData.length / (1024 * 1024)).toFixed(2)}MB Base64`);
          socket.emit('error', { 
            message: `Image is too large (${(imageData.length / (1024 * 1024)).toFixed(1)}MB). Please try again with a smaller image.`,
            type: 'image_too_large'
          });
          return;
        }

        // Prepare message data
        const messageData = {
          message: message ? message.trim() : '',
          user: user.trim(),
          room: room.trim(),
          socketId: socket.id,
          messageType: messageType || 'text'
        };

        // Add image data if provided
        if (imageData) {
          messageData.imageData = imageData;
        }

        // Add reply information if provided
        if (replyTo) {
          console.log('📝 Adding reply data to message:', replyTo);
          messageData.replyTo = replyTo;
        }

        console.log('💾 Saving message to database:', messageData);
        // Save message to database
        const newMessage = await messageModel.create(messageData);
        console.log('✅ Message saved:', newMessage);

        // Emit to all users in the room (including sender)
        const messagePayload = {
          _id: newMessage._id,
          message: newMessage.message,
          user: newMessage.user,
          room: newMessage.room,
          timestamp: newMessage.timestamp,
          socketId: socket.id,
          status: newMessage.status,
          replyTo: newMessage.replyTo,
          messageType: newMessage.messageType,
          imageData: newMessage.imageData
        };

        console.log('📤 Emitting message payload:', messagePayload);
        io.to(room).emit('receive_message', messagePayload);

        // Auto-mark as delivered to all online users in the room (except sender)
        const roomUsersList = roomUsers.get(room) || new Set();
        const onlineUsers = Array.from(roomUsersList).filter(u => u.username !== user);
        
        // Mark as delivered for all online users
        for (const onlineUser of onlineUsers) {
          await messageModel.markAsDelivered(newMessage._id, onlineUser.username);
        }

        // Emit delivery status update to sender
        if (onlineUsers.length > 0) {
          socket.emit('message_delivered', {
            messageId: newMessage._id,
            deliveredTo: onlineUsers.map(u => u.username),
            deliveredAt: new Date()
          });
        }

        console.log(`💬 Message sent in room ${room}: ${user}: ${message}`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { 
          message: 'Failed to send message',
          error: error.message 
        });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { user, room, isTyping } = data;
      socket.to(room).emit('user_typing', {
        user,
        isTyping,
        socketId: socket.id
      });
    });

    // Handle message read receipts
    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId, userId } = data;
        
        // Mark message as read in database
        await messageModel.markAsRead(messageId, userId);
        
        // Get the message to find the sender
        const message = await messageModel.getById(messageId);
        if (message) {
          // Emit read receipt to the message sender and room
          io.to(message.room).emit('message_read', {
            messageId: messageId,
            readBy: userId,
            readAt: new Date(),
            originalSender: message.user
          });
        }
        
        console.log(`📖 Message ${messageId} marked as read by ${userId}`);
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { 
          message: 'Failed to mark message as read',
          error: error.message 
        });
      }
    });

    // Handle bulk mark messages as read (when user opens/focuses chat)
    socket.on('mark_messages_read_bulk', async (data) => {
      try {
        const { messageIds, userId } = data;
        
        for (const messageId of messageIds) {
          await messageModel.markAsRead(messageId, userId);
          
          // Get the message to find the sender
          const message = await messageModel.getById(messageId);
          if (message) {
            // Emit read receipt to the message sender and room
            io.to(message.room).emit('message_read', {
              messageId: messageId,
              readBy: userId,
              readAt: new Date(),
              originalSender: message.user
            });
          }
        }
        
        console.log(`📖 ${messageIds.length} messages marked as read by ${userId}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { 
          message: 'Failed to mark messages as read',
          error: error.message 
        });
      }
    });

    // Handle message reactions
    socket.on('toggle_reaction', async (data) => {
      try {
        const { messageId, emoji, username, room } = data;
        console.log(`😀 Toggling reaction: ${emoji} by ${username} on message ${messageId}`);
        
        const result = await messageModel.toggleReaction(messageId, emoji, username);
        
        if (result) {
          if (result.action === 'blocked') {
            // Send error message to the user who tried to change reaction
            socket.emit('reaction_blocked', {
              messageId,
              emoji,
              error: result.error
            });
            console.log(`🚫 Reaction blocked: ${emoji} by ${username} - ${result.error}`);
          } else {
            // Emit reaction update to all users in the room
            io.to(room).emit('reaction_updated', {
              messageId,
              reactions: result.reactions,
              action: result.action,
              emoji,
              username
            });
            
            console.log(`✅ Reaction ${result.action}: ${emoji} by ${username}`);
          }
        } else {
          socket.emit('error', { 
            message: 'Failed to toggle reaction'
          });
        }
      } catch (error) {
        console.error('Error toggling reaction:', error);
        socket.emit('error', { 
          message: 'Failed to toggle reaction',
          error: error.message 
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
      
      if (socket.room && socket.username) {
        // Remove user from room tracking
        const users = roomUsers.get(socket.room);
        if (users) {
          // Find and remove the user with matching socketId
          const userToRemove = Array.from(users).find(user => user.socketId === socket.id);
          if (userToRemove) {
            users.delete(userToRemove);
            
            // Clean up empty room
            if (users.size === 0) {
              roomUsers.delete(socket.room);
            }
          }
        }
        
        // Update room users list
        updateRoomUsers(socket.room);
        
        socket.to(socket.room).emit('user_left', {
          message: `${socket.username} left the room`,
          timestamp: new Date(),
          type: 'system'
        });
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};
