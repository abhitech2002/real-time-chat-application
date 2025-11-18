const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

module.exports = (io) => {
  // Store online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    // User joins
    socket.on('user-online', async (userId) => {
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
          lastSeen: new Date()
        });

        onlineUsers.set(userId, socket.id);

        io.emit('user-status-change', {
          userId,
          isOnline: true
        });

        console.log(`User ${userId} is now online`);
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    });

    // Join room
    socket.on('join-room', async (roomId) => {
      socket.join(`room-${roomId}`);
      console.log(`User joined room: ${roomId}`);
    });

    // Leave room
    socket.on('leave-room', (roomId) => {
      socket.leave(`room-${roomId}`);
      console.log(`User left room: ${roomId}`);
    });

    // Send message (Direct or Group)
    socket.on('send-message', async (data) => {
      try {
        const { senderId, receiverId, roomId, content, messageType, fileUrl, fileName, fileSize } = data;

        // Create message
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId || null,
          room: roomId || null,
          content,
          messageType: messageType || 'text',
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileSize: fileSize || null
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar')
          .populate('receiver', 'username avatar');

        // If it's a room message
        if (roomId) {
          // Update room's last message
          await Room.findByIdAndUpdate(roomId, {
            lastMessage: message._id,
            lastMessageAt: new Date()
          });

          // Emit to all room members
          io.to(`room-${roomId}`).emit('receive-message', populatedMessage);
        } else {
          // Direct message - emit to receiver
          const receiverSocketId = onlineUsers.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive-message', populatedMessage);
          }
        }

        // Confirm to sender
        socket.emit('message-sent', populatedMessage);

        console.log(`Message sent from ${senderId} to ${receiverId || `room ${roomId}`}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message-error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing-start', (data) => {
      const { senderId, receiverId, roomId } = data;
      
      if (roomId) {
        // Broadcast to room
        socket.to(`room-${roomId}`).emit('user-typing', { userId: senderId, roomId });
      } else {
        // Send to specific user
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user-typing', { userId: senderId });
        }
      }
    });

    socket.on('typing-stop', (data) => {
      const { senderId, receiverId, roomId } = data;
      
      if (roomId) {
        socket.to(`room-${roomId}`).emit('user-stopped-typing', { userId: senderId, roomId });
      } else {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('user-stopped-typing', { userId: senderId });
        }
      }
    });

    // Mark messages as read
    socket.on('mark-as-read', async (data) => {
      try {
        const { messageIds, userId } = data;
        
        await Message.updateMany(
          { _id: { $in: messageIds } },
          {
            isRead: true,
            readAt: new Date(),
            $push: {
              readBy: {
                user: userId,
                readAt: new Date()
              }
            }
          }
        );

        socket.emit('messages-marked-read', { messageIds });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log('❌ Client disconnected:', socket.id);

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
          await User.findByIdAndUpdate(disconnectedUserId, {
            isOnline: false,
            socketId: null,
            lastSeen: new Date()
          });

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