# Chat Application Documentation

## Introduction

Chat Application is an online messaging platform with real-time communication capabilities, developed using a client-server architecture model. The application allows users to register, log in, search for other users, and exchange messages with file attachments.

## Project Structure

The project is divided into two main parts:

### 1. Frontend (chatapp.frontend)
- Built with Next.js and TypeScript
- Uses Tailwind CSS for user interface
- Framer Motion for animations
- Socket.io Client for real-time connections

### 2. Backend (chatapp.backend)
- Node.js with Express.js and TypeScript
- MongoDB as database
- Socket.io for real-time communication
- JWT for authentication
- Redis for session management
- Multer for file attachment handling

## Installation and Launch

### Backend

1. Navigate to the backend directory:
```bash
cd chatapp.backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
   - Create a .env file or use the existing one with the following settings:
     ```
     MONGO_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/chat_app
     JWT_SECRET=your_secret_key
     PORT=5050
     REDIS_HOST=localhost
     REDIS_PORT=6379
     REDIS_PASSWORD=
     ACCESS_TOKEN_EXPIRY=15m
     REFRESH_TOKEN_EXPIRY=7d
     ```

4. Start the server:
```bash
npm run dev
```

### Frontend

1. Navigate to the frontend directory:
```bash
cd chatapp.frontend
```

2. Install dependencies:
```bash
npm install
```

3. Launch the application:
```bash
npm run dev
```

4. Access the application at [http://localhost:3000](http://localhost:3000)

## Key Features

### User Authentication
- Account registration
- Login
- Logout
- Session management (using Access and Refresh Tokens)

### Chat and Messaging
- User search
- Text message sending
- File attachments (images and other file types)
- Display user online status
- View message history
- Display "typing" and "seen" notifications

### User Interface
- Classic and beta interface modes
- Responsive design for both mobile and desktop devices
- Connection status display
- Console Log to monitor application activity

## Backend API Structure

### User Management
- `POST /api/auth/register` - Register account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user information
- `GET /api/users` - Get user list
- `GET /api/users/:username` - Find user by name

### Message Management
- `POST /api/messages/send` - Send message
- `GET /api/messages/history` - Get message history
- `GET /api/users/:userId/recent-chats` - Get recent conversations list

## Data Models

### User
- _id: String
- username: String
- password: String
- socketId: String (nullable)

### Message
- senderId: String (linked to User)
- receiverId: String (linked to User)
- conversationId: String
- content: String
- createdAt: Date
- attachments: String[]

### Conversation
- conversationId: String (format "userA_userB")
- participants: ObjectId[] (linked to User)
- lastMessage: String
- updatedAt: Date
- createdAt: Date

### RefreshToken
- userId: ObjectId (linked to User)
- token: String
- isRevoked: Boolean
- expiresAt: Date
- createdAt: Date
- updatedAt: Date

## Socket.io Events

### Server-to-Client
- `user:online_list` - Update online users list
- `chat:message` - Receive general message
- `chat:private_message` - Receive private message
- `typing` - User typing notification
- `seen` - Message seen notification
- `notify:receive` - Receive notification

### Client-to-Server
- `chat:message` - Send general message
- `chat:private_message` - Send private message
- `typing` - Typing notification
- `seen` - Mark as seen
- `notify:send` - Send notification
- `disconnect` - Disconnect

## Core Technologies

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion, axios
- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: MongoDB
- **Cache**: Redis
- **Attachments**: Multer
- **Testing**: Jest, Supertest

## Development and Extension

To extend the project, you can focus on the following areas:

1. **Additional Features**:
   - Send audio and video messages
   - Create chat groups
   - Add video calling functionality

2. **Performance Improvements**:
   - Optimize database queries
   - Add pagination for message history

3. **Security**:
   - End-to-end encryption for messages
   - Two-factor authentication

## Troubleshooting

### Socket Connection Issues
- Check if the backend is running
- Check CORS settings in the backend
- Check authentication token

### Authentication Issues
- Check token expiration
- Clear browser cache and try logging in again

### Attachment Issues
- Check if the uploads directory exists and has write permissions in the backend
- Check if file size does not exceed configured limits

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs/v4)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Express.js Documentation](https://expressjs.com)
- [JWT.io](https://jwt.io)

---

© 2025 ChatApp. All rights reserved.