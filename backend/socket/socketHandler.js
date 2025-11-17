const User = require('../models/User');
const Message = require('../models/Message');

module.exports = (io) => {
  // Store online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    // User joins
    socket.on('user-online', async (userId) => {
      try {
        // Update user's online status
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
          lastSeen: new Date()
        });

        // Store user in online users map
        onlineUsers.set(userId, socket.id);

        // Broadcast to all clients that user is online
        io.emit('user-status-change', {
          userId,
          isOnline: true
        });

        console.log(`User ${userId} is now online`);
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { senderId, receiverId, content, messageType, fileUrl } = data;

        // Save message to database
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content,
          messageType: messageType || 'text',
          fileUrl: fileUrl || null
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar')
          .populate('receiver', 'username avatar');

        // Emit to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive-message', populatedMessage);
        }

        // Also emit back to sender for confirmation
        socket.emit('message-sent', populatedMessage);

        console.log(`Message sent from ${senderId} to ${receiverId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing-start', (data) => {
      const { senderId, receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-typing', { userId: senderId });
      }
    });

    socket.on('typing-stop', (data) => {
      const { senderId, receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user-stopped-typing', { userId: senderId });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log('❌ Client disconnected:', socket.id);

      // Find and remove user from online users
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        try {
          // Update user's online status
          await User.findByIdAndUpdate(disconnectedUserId, {
            isOnline: false,
            socketId: null,
            lastSeen: new Date()
          });

          // Broadcast to all clients that user is offline
          io.emit('user-status-change', {
            userId: disconnectedUserId,
            isOnline: false
          });

          console.log(`User ${disconnectedUserId} is now offline`);
        } catch (error) {
          console.error('Error updating user status on disconnect:', error);
        }
      }
    });
  });
};