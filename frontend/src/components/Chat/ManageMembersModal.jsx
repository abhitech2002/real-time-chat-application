import React from 'react';
import './Chat.css';

const ManageMembersModal = ({ room, currentUserId, onClose, onRemoveMember }) => {
  if (!room) return null;

  const isCreator = room.creator && room.creator._id === currentUserId;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Manage Members</h3>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <div className="modal-body">
          {room.members && room.members.length > 0 ? (
            room.members.map(member => (
              <div key={member._id} className="member-row">
                <img src={member.avatar} alt={member.username} className="member-avatar" />
                <div className="member-info">
                  <strong>{member.username}</strong>
                  <div className="member-status">{member.isOnline ? 'Online' : 'Offline'}</div>
                </div>
                {isCreator && member._id !== currentUserId && (
                  <button
                    className="remove-member-btn"
                    onClick={() => onRemoveMember(member._id)}
                    title="Remove member"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No members</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageMembersModal;
