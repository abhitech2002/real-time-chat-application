const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createRoom,
  getRooms,
  getRoomById,
  getRoomMessages,
  addMember,
  leaveRoom
} = require('../controllers/roomController');

// Room routes
router.post('/', protect, createRoom);
router.get('/', protect, getRooms);
router.get('/:id', protect, getRoomById);
router.get('/:id/messages', protect, getRoomMessages);
router.post('/:id/members', protect, addMember);
router.delete('/:id/leave', protect, leaveRoom);

module.exports = router;