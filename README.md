# ChatX - Real-time Chat Application

A modern real-time chat application built with React, Node.js, Socket.IO, and MongoDB Atlas.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS + Socket.IO Client
- **Backend**: Node.js + Express + Socket.IO + MongoDB Atlas
- **Real-time**: Socket.IO for instant messaging
- **Database**: MongoDB Atlas for message persistence

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd backend_chatx
npm install
node server.js
```

Server will run on `http://localhost:3001`

### 2. Start the Frontend

```bash
cd chatx
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## ✨ Features

### Real-time Messaging
- ✅ Instant message delivery via Socket.IO
- ✅ Multiple chat rooms (general, random, tech, gaming)
- ✅ Typing indicators
- ✅ User join/leave notifications
- ✅ Connection status indicators

### Modern UI/UX
- ✅ Dark theme with gradient accents
- ✅ Responsive design (mobile-first)
- ✅ Smooth animations and transitions
- ✅ Loading states and error handling
- ✅ Clean message bubbles with timestamps

### Backend Features
- ✅ RESTful API for message operations
- ✅ Socket.IO real-time communication
- ✅ MongoDB Atlas integration
- ✅ Comprehensive error handling
- ✅ Input validation with Joi
- ✅ Proper folder structure

## 📡 API Endpoints

### REST API
- `POST /api/messages` - Send a message
- `GET /api/messages` - Get messages (with pagination & room filtering)
- `GET /api/messages/:id` - Get specific message
- `DELETE /api/messages/:id` - Delete message
- `GET /health` - Health check

### Socket.IO Events
- `join_room` - Join a chat room
- `send_message` - Send real-time message
- `receive_message` - Receive messages
- `typing` - Typing indicators
- `user_joined/left` - User notifications

## 🎯 Usage

1. **Home Page**: Click "Start Chatting"
2. **User Setup**: Enter username and select room
3. **Chat**: Send messages, see typing indicators, real-time updates
4. **Leave**: Click back arrow to return to home

## 🔧 Configuration

### Environment Variables (.env)
```
ATLAS_URI=your_mongodb_atlas_connection_string
PORT=3001
```

### Frontend Configuration
- Backend URL: `http://localhost:3001`
- Socket.IO connection with WebSocket transport
- Axios for REST API calls

## 🏃‍♂️ Development

### Backend Development
```bash
cd backend_chatx
npm run dev  # Auto-restart on changes
```

### Frontend Development
```bash
cd chatx
npm run dev  # Hot reload enabled
```

## 📁 Project Structure

```
chat/
├── backend_chatx/          # Node.js Backend
│   ├── controllers/        # Business logic
│   ├── middleware/         # Error handling & validation
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── utils/             # Socket.IO handlers
│   └── server.js          # Main server file
├── chatx/                 # React Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API & Socket services
│   │   └── App.tsx        # Main app component
│   └── package.json
└── README.md
```

## 🎨 Design System

Following your user rules for consistent design:
- **Theme**: Dark (#0D0D0D/#121212) with blue/violet accents
- **Typography**: Modern sans-serif with proper hierarchy
- **Layout**: Grid/flex with consistent spacing
- **Components**: Rounded corners, soft shadows, hover effects
- **Animations**: Subtle GSAP-style transitions

Your real-time chat system is ready! 🚀
