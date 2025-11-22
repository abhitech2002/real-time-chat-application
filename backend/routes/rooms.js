const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createRoom,
  getRooms,
  getRoomById,
  getRoomMessages,
  addMember,
  leaveRoom,
  removeMember,
  deleteRoom
} = require('../controllers/roomController');

// Room routes
router.post('/', protect, createRoom);
router.get('/', protect, getRooms);
router.get('/:id', protect, getRoomById);
router.get('/:id/messages', protect, getRoomMessages);
router.post('/:id/members', protect, addMember);
router.delete('/:id/leave', protect, leaveRoom);
router.delete('/:id/members/:userId', protect, removeMember);
router.delete('/:id', protect, deleteRoom);

module.exports = router;