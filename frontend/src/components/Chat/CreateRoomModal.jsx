import { useState } from 'react';
import { roomsAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import './Chat.css';

const CreateRoomModal = ({ users, onClose, onRoomCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleMember = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Room name is required');
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error('Select at least one member');
      return;
    }

    setLoading(true);

    try {
      const response = await roomsAPI.createRoom({
        ...formData,
        members: selectedMembers
      });

      toast.success('Room created successfully!');
      onRoomCreated(response.data.data);
      onClose();
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Group Chat</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Group Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter group description (optional)"
              rows="3"
            />
          </div>

          <div className="form-group-checkbox">
            <input
              type="checkbox"
              id="isPrivate"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
            />
            <label htmlFor="isPrivate">Private Group</label>
          </div>

          <div className="form-group">
            <label>Select Members *</label>
            <div className="member-list">
              {users.map(user => (
                <div
                  key={user._id}
                  className={`member-item ${selectedMembers.includes(user._id) ? 'selected' : ''}`}
                  onClick={() => toggleMember(user._id)}
                >
                  <img src={user.avatar} alt={user.username} />
                  <span>{user.username}</span>
                  {selectedMembers.includes(user._id) && <span className="check">✓</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;