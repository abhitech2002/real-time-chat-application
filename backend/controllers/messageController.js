const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Get messages between current user and target user
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'username avatar isOnline')
    .populate('receiver', 'username avatar isOnline')
    .sort({ createdAt: 1 })
    .limit(100); // Limit to last 100 messages

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Update all unread messages from userId to current user
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiver: currentUserId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};