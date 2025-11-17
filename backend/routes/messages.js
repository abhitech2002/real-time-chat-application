const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConversation, markAsRead, getUnreadCount } = require('../controllers/messageController');

// @desc    Get conversation with a user
// @route   GET /api/messages/:userId
// @access  Private
router.get('/:userId', protect, getConversation);

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:userId
// @access  Private
router.put('/read/:userId', protect, markAsRead);

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
router.get('/unread/count', protect, getUnreadCount);

module.exports = router;