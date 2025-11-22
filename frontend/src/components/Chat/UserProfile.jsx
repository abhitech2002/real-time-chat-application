import { useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import './Chat.css';

const UserProfile = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Profile</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <div className="profile-content">
          <div className="profile-avatar-section">
            <img 
              src={user.avatar} 
              alt={user.username}
              className="profile-avatar-large"
            />
            <span className="status-badge online">Online</span>
          </div>

          <div className="profile-info-section">
            <div className="profile-field">
              <label>Username</label>
              <div className="profile-value">
                <span className="username-display">@{user.username}</span>
              </div>
            </div>

            <div className="profile-field">
              <label>Email</label>
              <div className="profile-value">{user.email}</div>
            </div>

            <div className="profile-field">
              <label>Member Since</label>
              <div className="profile-value">
                {formatDate(user.createdAt || new Date())}
              </div>
            </div>

            <div className="profile-field">
              <label>Status</label>
              <div className="profile-value">
                <span className="status-active">🟢 Active</span>
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">Online</span>
              <span className="stat-label">Status</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user._id.slice(-4)}</span>
              <span className="stat-label">User ID</span>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;