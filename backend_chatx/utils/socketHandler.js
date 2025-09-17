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
        console.log('🔄 Backend received message data:', data);
        const { message, user, room = 'general', replyTo } = data;

        // Validate data
        if (!message || !user) {
          socket.emit('error', { message: 'Message and user are required' });
          return;
        }

        // Prepare message data
        const messageData = {
          message: message.trim(),
          user: user.trim(),
          room: room.trim(),
          socketId: socket.id
        };

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
          replyTo: newMessage.replyTo
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
