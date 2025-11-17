import './Chat.css';

const UserList = ({ users, selectedUser, onSelectUser }) => {
  return (
    <div className="user-list">
      {users.length === 0 ? (
        <div className="no-users">
          <p>No users available</p>
        </div>
      ) : (
        users.map(user => (
          <div
            key={user._id}
            className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
            onClick={() => onSelectUser(user)}
          >
            <div className="user-avatar-container">
              <img 
                src={user.avatar} 
                alt={user.username}
                className="user-avatar"
              />
              <span className={`status-dot ${user.isOnline ? 'online' : 'offline'}`}></span>
            </div>
            
            <div className="user-details">
              <div className="user-header">
                <h4>{user.username}</h4>
              </div>
              <p className="user-status">
                {user.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserList;