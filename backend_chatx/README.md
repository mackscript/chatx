# ChatX Backend - Socket.IO Chat System

A real-time chat system built with Node.js, Express, Socket.IO, and MongoDB Atlas.

## 📁 Project Structure

```
backend_chatx/
├── controllers/          # Business logic
│   └── messageController.js
├── middleware/          # Custom middleware
│   ├── errorHandler.js
│   └── validation.js
├── models/             # Database models
│   └── Message.js
├── routes/             # API routes
│   └── messageRoutes.js
├── utils/              # Utility functions
│   └── socketHandler.js
├── .env               # Environment variables
├── server.js          # Main server file
└── package.json
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
# or for development with auto-restart:
npm run dev
```

3. Server will run on `http://localhost:3001`

## 📡 REST API Endpoints

### Messages

#### POST /api/messages
Send a new message

**Request Body:**
```json
{
  "message": "Hello world!",
  "user": "john_doe",
  "room": "general"  // optional, defaults to "general"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "...",
    "message": "Hello world!",
    "user": "john_doe",
    "room": "general",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/messages
Get all messages with optional filtering

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50, max: 100)
- `skip` (optional): Number of messages to skip (default: 0)
- `room` (optional): Filter by room name

**Examples:**
```
GET /api/messages
GET /api/messages?limit=20&skip=10
GET /api/messages?room=general&limit=30
```

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": [...],
  "count": 25
}
```

#### GET /api/messages/:id
Get a specific message by ID

#### DELETE /api/messages/:id
Delete a message by ID

## 🔌 Socket.IO Events

### Client → Server Events

#### `join_room`
Join a chat room
```javascript
socket.emit('join_room', 'general');
```

#### `send_message`
Send a message to a room
```javascript
socket.emit('send_message', {
  message: 'Hello everyone!',
  user: 'john_doe',
  room: 'general'
});
```

#### `typing`
Send typing indicator
```javascript
socket.emit('typing', {
  user: 'john_doe',
  room: 'general',
  isTyping: true
});
```

### Server → Client Events

#### `receive_message`
Receive a new message
```javascript
socket.on('receive_message', (data) => {
  console.log('New message:', data);
});
```

#### `user_joined`
User joined the room
```javascript
socket.on('user_joined', (data) => {
  console.log('User joined:', data);
});
```

#### `user_left`
User left the room
```javascript
socket.on('user_left', (data) => {
  console.log('User left:', data);
});
```

#### `user_typing`
User typing indicator
```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data);
});
```

#### `error`
Error occurred
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

## 🛡️ Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data or validation errors
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Database or server errors

Error responses follow this format:
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message",
  "details": null  // Additional error details if available
}
```

## 🔧 Environment Variables

Create a `.env` file with:
```
ATLAS_URI=your_mongodb_atlas_connection_string
PORT=3001
```

## 📊 Health Check

Check server and database status:
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
