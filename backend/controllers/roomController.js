const Room = require('../models/Room');
const Message = require('../models/Message');

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    console.log('Creating room with data:', req.body);
    const { name, description, members, isPrivate } = req.body;
    const creator = req.user._id;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Room name is required'
      });
    }

    if (!members || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one member is required'
      });
    }

    // Create room with creator included in members
    const allMembers = [creator, ...members.filter(m => m !== creator.toString())];

    const room = await Room.create({
      name: name.trim(),
      description: description?.trim() || '',
      creator,
      members: allMembers,
      isPrivate: isPrivate || false
    });

    console.log('Room created:', room._id);

    const populatedRoom = await Room.findById(room._id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar isOnline');

    console.log('Room populated:', populatedRoom);

    res.status(201).json({
      success: true,
      data: populatedRoom
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all rooms for current user
// @route   GET /api/rooms
// @access  Private
exports.getRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    const rooms = await Room.find({ members: userId })
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar isOnline')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar isOnline');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is member
    const isMember = room.members.some(
      member => member._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this room'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get room messages
// @route   GET /api/rooms/:id/messages
// @access  Private
exports.getRoomMessages = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is member
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const isMember = room.members.some(
      member => member.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this room'
      });
    }

    const messages = await Message.find({ room: id })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 })
      .limit(100);

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

// @desc    Add member to room
// @route   POST /api/rooms/:id/members
// @access  Private
exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if requester is creator
    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only room creator can add members'
      });
    }

    // Check if user is already a member
    if (room.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }

    room.members.push(userId);
    await room.save();

    const updatedRoom = await Room.findById(id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar isOnline');

    res.status(200).json({
      success: true,
      data: updatedRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Leave room
// @route   DELETE /api/rooms/:id/leave
// @access  Private
exports.leaveRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is a member
    if (!room.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this room'
      });
    }

    // Remove user from members
    room.members = room.members.filter(
      member => member.toString() !== userId.toString()
    );

    // If creator leaves and there are other members, assign new creator
    if (room.creator.toString() === userId.toString() && room.members.length > 0) {
      room.creator = room.members[0];
    }

    // If no members left, delete the room
    if (room.members.length === 0) {
      await Room.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: 'Room deleted as last member left',
        deleted: true
      });
    }

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Left room successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove member from room (Creator only)
// @route   DELETE /api/rooms/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const requesterId = req.user._id;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Only creator can remove members
    if (room.creator.toString() !== requesterId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only room creator can remove members'
      });
    }

    // Cannot remove yourself (use leave instead)
    if (userId === requesterId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Use leave room to exit. Cannot remove yourself.'
      });
    }

    // Check if user is a member
    if (!room.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this room'
      });
    }

    // Remove member
    room.members = room.members.filter(
      member => member.toString() !== userId
    );

    await room.save();

    const updatedRoom = await Room.findById(id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar isOnline');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: updatedRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete room (Creator only)
// @route   DELETE /api/rooms/:id
// @access  Private
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Only creator can delete room
    if (room.creator.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only room creator can delete the room'
      });
    }

    await Room.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};