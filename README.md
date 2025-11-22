# Real-Time Chat Application

A full-stack real-time chat application built with React, Node.js, Express, Socket.io, and MongoDB. Features include one-on-one messaging, group chats, file sharing, online status tracking, and read receipts.

## 🚀 Features

### Core Features
- **Real-time Messaging**: Instant one-on-one and group chat using Socket.io
- **User Authentication**: Secure JWT-based authentication with password hashing
- **Online Status**: Real-time online/offline status tracking
- **Group Chats**: Create and manage group chat rooms
- **File Sharing**: Upload and share images and documents via Cloudinary
- **Read Receipts**: Track message read status
- **Typing Indicators**: See when users are typing
- **Message Search**: Search through conversation history
- **User Profiles**: View and manage user profiles
- **Responsive Design**: Modern, mobile-friendly UI

### Technical Features
- RESTful API architecture
- WebSocket real-time communication
- JWT authentication & authorization
- Password encryption with bcrypt
- File upload with Cloudinary integration
- MongoDB database with Mongoose ODM
- React Context API for state management
- Error handling and validation

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Toastify** - Notifications
- **Emoji Picker React** - Emoji support

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud file storage

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Cloudinary account (for file uploads)

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd real-time-chat-application
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/chat-app
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Client URL
CLIENT_URL=http://localhost:5173

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Run the Application

**Backend:**
```bash
cd backend
npm run dev  # Development mode with nodemon
# OR
npm start    # Production mode
```

**Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 📁 Project Structure

```
real-time-chat-application/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, upload middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── socket/          # Socket.io handlers
│   └── server.js        # Entry point
│
├── frontend/
│   ├── public/          # Static assets
│   └── src/
│       ├── components/  # React components
│       │   ├── Auth/    # Login, Signup
│       │   ├── Chat/    # Chat components
│       │   └── Common/  # Shared components
│       ├── context/     # React Context providers
│       ├── utils/       # Utility functions
│       └── main.jsx     # Entry point
│
└── README.md
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users` - Get all users (Protected)
- `GET /api/users/:id` - Get user by ID (Protected)

### Messages
- `GET /api/messages/:userId` - Get messages with a user (Protected)
- `POST /api/messages` - Send a message (Protected)

### Rooms
- `GET /api/rooms` - Get all rooms for user (Protected)
- `POST /api/rooms` - Create a room (Protected)
- `GET /api/rooms/:id/messages` - Get room messages (Protected)
- `PUT /api/rooms/:id` - Update room (Protected)
- `DELETE /api/rooms/:id` - Delete room (Protected)

### Upload
- `POST /api/upload` - Upload file (Protected)

## 🔌 Socket.io Events

### Client → Server
- `user-online` - User comes online
- `send-message` - Send a message
- `typing-start` - Start typing indicator
- `typing-stop` - Stop typing indicator
- `mark-as-read` - Mark messages as read
- `join-room` - Join a room
- `leave-room` - Leave a room

### Server → Client
- `user-status-change` - User online/offline status changed
- `online-users` - List of online users
- `receive-message` - Receive new message
- `message-sent` - Message sent confirmation
- `user-typing` - User is typing
- `user-stopped-typing` - User stopped typing
- `messages-marked-read` - Messages marked as read

## 🎨 Key Features Implementation

### Real-time Messaging
- Uses Socket.io for bidirectional communication
- Messages are stored in MongoDB and delivered in real-time
- Supports text, images, and file attachments

### Online Status
- Tracks user online/offline status via Socket.io connections
- Updates in real-time across all connected clients
- Handles reconnections gracefully

### Group Chats
- Create public or private group rooms
- Add/remove members
- Room settings and management
- Group message broadcasting

### File Uploads
- Supports images (JPG, PNG, GIF) and documents (PDF, DOC, DOCX, TXT)
- Files stored on Cloudinary
- Secure file type validation

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt (salt rounds: 10)
- Protected API routes with middleware
- Input validation and sanitization
- CORS configuration
- Secure file upload validation
- Password not returned in API responses

## 🚀 Deployment

### Backend Deployment (e.g., Heroku, Railway, Render)
1. Set environment variables in your hosting platform
2. Ensure MongoDB connection string is configured
3. Update CORS settings for production domain

### Frontend Deployment (e.g., Vercel, Netlify)
1. Build the project: `npm run build`
2. Set environment variables
3. Deploy the `dist` folder

## 📝 Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration (default: 7d)
- `CLIENT_URL` - Frontend URL for CORS
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check network connectivity

### Socket.io Connection Issues
- Verify CORS settings match frontend URL
- Check Socket.io server is running
- Ensure WebSocket is not blocked by firewall

### File Upload Issues
- Verify Cloudinary credentials are correct
- Check file size limits
- Ensure file types are allowed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Your Name - [Your GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Socket.io for real-time communication
- Cloudinary for file storage
- React and Express.js communities

---

**Note**: This is a portfolio project demonstrating full-stack development skills including real-time communication, authentication, file handling, and modern web technologies.

