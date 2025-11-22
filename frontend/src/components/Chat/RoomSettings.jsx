import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { roomsAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import './Chat.css';

const RoomSettings = ({ room, onClose, onRoomUpdated, onRoomDeleted }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isCreator = room.creator._id === user._id;

  const handleLeaveRoom = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    setLoading(true);
    try {
      const response = await roomsAPI.leaveRoom(room._id);
      
      if (response.data.deleted) {
        toast.success('Room deleted (last member left)');
        onRoomDeleted(room._id);
      } else {
        toast.success('Left room successfully');
        onRoomDeleted(room._id);
      }
      
      onClose();
    } catch (error) {
      console.error('Error leaving room:', error);
      toast.error(error.response?.data?.message || 'Failed to leave room');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member from the group?')) return;

    setLoading(true);
    try {
      const response = await roomsAPI.removeMember(room._id, memberId);
      toast.success('Member removed successfully');
      onRoomUpdated(response.data.data);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    setLoading(true);
    try {
      await roomsAPI.deleteRoom(room._id);
      toast.success('Room deleted successfully');
      onRoomDeleted(room._id);
      onClose();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error(error.response?.data?.message || 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Group Settings</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <div className="room-settings-content">
          {/* Room Info */}
          <div className="room-info-section">
            <img 
              src={room.avatar || 'https://via.placeholder.com/150?text=Group'} 
              alt={room.name}
              className="room-avatar-large"
            />
            <h3>{room.name}</h3>
            {room.description && <p className="room-description">{room.description}</p>}
            <div className="room-meta">
              <span>Created by: <strong>@{room.creator.username}</strong></span>
              <span>{room.members.length} members</span>
            </div>
          </div>

          {/* Members List */}
          <div className="members-section">
            <h4>Members ({room.members.length})</h4>
            <div className="members-list-settings">
              {room.members.map(member => (
                <div key={member._id} className="member-item-settings">
                  <div className="member-info">
                    <img src={member.avatar} alt={member.username} />
                    <div>
                      <span className="member-name">
                        {member.username}
                        {member._id === room.creator._id && (
                          <span className="creator-badge">Creator</span>
                        )}
                      </span>
                      <span className={`member-status ${member.isOnline ? 'online' : 'offline'}`}>
                        {member.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  
                  {isCreator && member._id !== user._id && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="remove-member-btn"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="room-actions">
            {isCreator ? (
              <>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-danger"
                  disabled={loading}
                >
                  Delete Group
                </button>
                <button 
                  onClick={handleLeaveRoom}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Leave Group
                </button>
              </>
            ) : (
              <button 
                onClick={handleLeaveRoom}
                className="btn-danger"
                disabled={loading}
              >
                Leave Group
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-dialog">
              <h3>⚠️ Delete Group?</h3>
              <p>This action cannot be undone. All messages will be permanently deleted.</p>
              <div className="confirm-actions">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteRoom}
                  className="btn-danger"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSettings;