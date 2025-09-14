import { Message } from '../models/Message.js';

export const setupSocketHandlers = (io, db) => {
  const messageModel = new Message(db);

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join a room
    socket.on('join_room', (room) => {
      socket.join(room);
      socket.room = room;
      console.log(`👤 User ${socket.id} joined room: ${room}`);
      
      // Notify others in the room
      socket.to(room).emit('user_joined', {
        message: `A user joined the room`,
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
      
      if (socket.room) {
        socket.to(socket.room).emit('user_left', {
          message: `A user left the room`,
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
