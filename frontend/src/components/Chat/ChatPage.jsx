import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { usersAPI, roomsAPI } from '../../utils/api';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import CreateRoomModal from './CreateRoomModal';
import UserProfile from './UserProfile';
import LoadingSpinner from '../Common/LoadingSpinner';
import './Chat.css';

const ChatPage = () => {
  const { user, logout } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);
  
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'rooms'
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users and rooms
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Debug: Check token
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        console.log('Fetching users and rooms...');
        const [usersResponse, roomsResponse] = await Promise.all([
          usersAPI.getAllUsers(),
          roomsAPI.getRooms()
        ]);
        console.log('Users response:', usersResponse.data);
        console.log('Rooms response:', roomsResponse.data);
        // Clear isOnline from database - we'll set it based on socket onlineUsers
        const usersWithoutStatus = usersResponse.data.data.map(u => ({
          ...u,
          isOnline: false // Will be updated by onlineUsers effect
        }));
        setUsers(usersWithoutStatus);
        setRooms(roomsResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error details:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update users' online status based on socket onlineUsers (not database isOnline)
  useEffect(() => {
    if (onlineUsers.length > 0 || users.length > 0) {
      setUsers(prevUsers => 
        prevUsers.map(u => ({
          ...u,
          // Only use socket's onlineUsers list, ignore database isOnline field
          isOnline: onlineUsers.includes(u._id)
        }))
      );
    }
  }, [onlineUsers]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedRoom(null);
  };

  const handleSelectRoom = (room) => {
    console.log('Selecting room:', room);
    setSelectedRoom(room);
    setSelectedUser(null);
    
    // Join room via socket
    if (socket && room._id) {
      console.log('Joining room via socket:', room._id);
      socket.emit('join-room', room._id);
    }
  };

  const handleRoomCreated = (newRoom) => {
    console.log('Room created:', newRoom);
    setRooms(prev => [newRoom, ...prev]);
    setActiveTab('rooms'); // Switch to rooms tab
    handleSelectRoom(newRoom);
  };

  // Filter users and rooms based on search
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-page">
        <LoadingSpinner size="large" message="Loading chat..." />
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div 
            className="user-profile"
            onClick={() => setShowProfile(true)}
            style={{ cursor: 'pointer' }}
          >
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

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            💬 Chats
          </button>
          <button
            className={`tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            👥 Groups
          </button>
        </div>

        {activeTab === 'users' ? (
          <>
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search users..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <UserList 
              users={filteredUsers}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
            />
            
            {/* Debug info - remove later */}
            <div style={{ padding: '20px', fontSize: '12px', color: '#666' }}>
              <p>Total users: {users.length}</p>
              <p>Rooms: {rooms.length}</p>
            </div>
          </>
        ) : (
          <>
            <button 
              className="create-room-btn"
              onClick={() => setShowCreateRoom(true)}
            >
              + Create Group
            </button>
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search groups..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="user-list">
              {filteredRooms.length === 0 ? (
                <div className="no-users">
                  <p>No groups yet. Create one!</p>
                </div>
              ) : (
                rooms.map(room => (
                  <div
                    key={room._id}
                    className={`user-item ${selectedRoom?._id === room._id ? 'active' : ''}`}
                    onClick={() => handleSelectRoom(room)}
                  >
                    <img 
                      src={room.avatar || 'https://via.placeholder.com/150?text=Group'} 
                      alt={room.name || 'Group'} 
                      className="user-avatar" 
                    />
                    <div className="user-details">
                      <h4>{room.name || 'Unnamed Group'}</h4>
                      <p className="user-status">
                        {room.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Chat Area */}
      <div className="chat-main">
        {selectedUser || selectedRoom ? (
          <ChatWindow 
            selectedUser={selectedUser}
            selectedRoom={selectedRoom}
            currentUser={user}
            socket={socket}
          />
        ) : (
          <div className="no-chat-selected">
            <div className="empty-state">
              <h2>💬 Welcome to Chat App!</h2>
              <p>Select a user or group to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <CreateRoomModal
          users={users}
          onClose={() => setShowCreateRoom(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default ChatPage;