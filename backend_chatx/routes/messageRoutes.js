import express from 'express';
import { MessageController } from '../controllers/messageController.js';
import { validate, messageValidation } from '../middleware/validation.js';

export const createMessageRoutes = (db) => {
  const router = express.Router();
  const messageController = new MessageController(db);

  // POST /api/messages - Send a new message
  router.post('/', 
    validate(messageValidation.create), 
    messageController.sendMessage
  );

  // GET /api/messages - Get all messages with optional filtering
  router.get('/', messageController.getAllMessages);

  // GET /api/messages/:id - Get message by ID
  router.get('/:id', messageController.getMessageById);

  // DELETE /api/messages/:id - Delete message by ID
  router.delete('/:id', messageController.deleteMessage);

  return router;
};
