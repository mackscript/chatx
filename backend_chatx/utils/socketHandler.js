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
        const { message, user, room = 'general' } = data;

        // Validate data
        if (!message || !user) {
          socket.emit('error', { message: 'Message and user are required' });
          return;
        }

        // Save message to database
        const newMessage = await messageModel.create({
          message: message.trim(),
          user: user.trim(),
          room: room.trim(),
          socketId: socket.id
        });

        // Emit to all users in the room (including sender)
        io.to(room).emit('receive_message', {
          _id: newMessage._id,
          message: newMessage.message,
          user: newMessage.user,
          room: newMessage.room,
          timestamp: newMessage.timestamp,
          socketId: socket.id
        });

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
