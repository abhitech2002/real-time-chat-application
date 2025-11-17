import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { usersAPI } from '../../utils/api';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import './Chat.css';

const ChatPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersAPI.getAllUsers();
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Update users' online status
  useEffect(() => {
    setUsers(prevUsers => 
      prevUsers.map(u => ({
        ...u,
        isOnline: onlineUsers.includes(u._id)
      }))
    );
  }, [onlineUsers]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  if (loading) {
    return <div className="loading">Loading chat...</div>;
  }

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <img src={user.avatar} alt={user.username} />
            <div className="user-info">
              <h3>{user.username}</h3>
              <span className="status-online">Online</span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn" title="Logout">
            🚪
          </button>
        </div>

        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="search-input"
          />
        </div>

        <UserList 
          users={users}
          selectedUser={selectedUser}
          onSelectUser={handleSelectUser}
        />
      </div>

      {/* Chat Area */}
      <div className="chat-main">
        {selectedUser ? (
          <ChatWindow 
            selectedUser={selectedUser}
            currentUser={user}
            socket={socket}
          />
        ) : (
          <div className="no-chat-selected">
            <div className="empty-state">
              <h2>💬 Welcome to Chat App!</h2>
              <p>Select a user from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;