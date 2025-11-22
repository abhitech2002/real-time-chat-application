import { useState, useEffect, useRef } from 'react';
import { messagesAPI, roomsAPI } from '../../utils/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import SearchMessages from './SearchMessages';
import LoadingSpinner from '../Common/LoadingSpinner';
import RoomSettings from './RoomSettings';
import { toast } from 'react-toastify';
import './Chat.css';

const ChatWindow = ({ selectedUser, selectedRoom, currentUser, socket, onRoomDeleted }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const isRoom = !!selectedRoom;
  const chatTarget = selectedRoom || selectedUser;

  // Early return if no chat target
  if (!chatTarget) {
    return (
      <div className="chat-window">
        <div className="no-chat-selected">
          <div className="empty-state">
            <h2>💬 Welcome to Chat App!</h2>
            <p>Select a user or group to start chatting</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is near bottom of scroll
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const container = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  };

  // Scroll to bottom - only if user is near bottom or explicitly requested
  const scrollToBottom = (force = false) => {
    if (!messagesContainerRef.current) return;
    
    if (force || isNearBottom()) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        const container = messagesContainerRef.current;
        if (container) {
          // Use direct scrollTop manipulation for better control
          container.scrollTop = container.scrollHeight;
        }
      }, 50);
    }
  };

  // Fetch message history
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatTarget) return;
      
      setLoading(true);
      try {
        const response = isRoom
          ? await roomsAPI.getRoomMessages(chatTarget._id)
          : await messagesAPI.getMessages(chatTarget._id);
        setMessages(response.data.data);
        
        // Mark messages as read
        if (socket && !isRoom && response.data.data.length > 0) {
          const unreadMessages = response.data.data
            .filter(m => m.receiver._id === currentUser._id && !m.isRead)
            .map(m => m._id);
          
          if (unreadMessages.length > 0) {
            socket.emit('mark-as-read', {
              messageIds: unreadMessages,
              userId: currentUser._id
            });
          }
        }
        
        // Scroll to bottom only on initial load - use longer delay to ensure DOM is ready
        setTimeout(() => scrollToBottom(true), 200);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatTarget, isRoom, socket, currentUser._id]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on('receive-message', (message) => {
      const isRelevant = isRoom
        ? message.room === chatTarget._id
        : message.sender._id === chatTarget._id;

      if (isRelevant) {
        setMessages(prev => {
          const exists = prev.find(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
        // Auto-scroll to bottom when receiving new messages (if near bottom)
        setTimeout(() => scrollToBottom(), 150);
      }
    });

    // Listen for message sent confirmation
    socket.on('message-sent', (message) => {
      setMessages(prev => {
        const exists = prev.find(m => m._id === message._id);
        if (exists) return prev;
        
        // Scroll to bottom when YOU send a message
        setTimeout(() => scrollToBottom(true), 150);
        
        return [...prev, message];
      });
    });

    // Listen for typing indicators
    socket.on('user-typing', (data) => {
      const isRelevant = isRoom
        ? data.roomId === chatTarget._id
        : data.userId === chatTarget._id;

      if (isRelevant) {
        setIsTyping(true);
      }
    });

    socket.on('user-stopped-typing', (data) => {
      const isRelevant = isRoom
        ? data.roomId === chatTarget._id
        : data.userId === chatTarget._id;

      if (isRelevant) {
        setIsTyping(false);
      }
    });

    // Handle errors
    socket.on('message-error', (error) => {
      toast.error(error.message || 'Failed to send message');
    });

    // Listen for read receipts
    socket.on('messages-marked-read', (data) => {
      setMessages(prev => prev.map(msg => 
        data.messageIds.includes(msg._id) 
          ? { ...msg, isRead: true, readAt: new Date() }
          : msg
      ));
    });

    return () => {
      socket.off('receive-message');
      socket.off('message-sent');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      socket.off('message-error');
      socket.off('messages-marked-read');
    };
  }, [socket, chatTarget, isRoom]);

  const handleSendMessage = (content) => {
    if (!content.trim() || !socket) return;

    const messageData = {
      senderId: currentUser._id,
      content: content.trim(),
      messageType: 'text'
    };

    if (isRoom) {
      messageData.roomId = chatTarget._id;
    } else {
      messageData.receiverId = chatTarget._id;
    }

    socket.emit('send-message', messageData);
  };

  const handleFileMessage = (fileData) => {
    if (!socket) return;

    const messageData = {
      senderId: currentUser._id,
      content: fileData.name,
      messageType: fileData.type,
      fileUrl: fileData.url,
      fileName: fileData.name,
      fileSize: fileData.size
    };

    if (isRoom) {
      messageData.roomId = chatTarget._id;
    } else {
      messageData.receiverId = chatTarget._id;
    }

    socket.emit('send-message', messageData);
  };

  const handleTyping = (isTyping) => {
    if (!socket) return;

    const typingData = { senderId: currentUser._id };

    if (isRoom) {
      typingData.roomId = chatTarget._id;
    } else {
      typingData.receiverId = chatTarget._id;
    }

    if (isTyping) {
      socket.emit('typing-start', typingData);
    } else {
      socket.emit('typing-stop', typingData);
    }
  };

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <img 
            src={chatTarget.avatar || 'https://via.placeholder.com/150'} 
            alt={chatTarget.name || chatTarget.username || 'User'} 
          />
          <div>
            <h3>{chatTarget.name || chatTarget.username || 'Unknown'}</h3>
            <span className={!isRoom && chatTarget.isOnline ? 'status-online' : 'status-offline'}>
              {isRoom
                ? `${chatTarget.members?.length || 0} members`
                : chatTarget.isOnline
                ? 'Online'
                : 'Offline'}
            </span>
          </div>
        </div>
        
        <div className="chat-header-actions">
          <button 
            className="search-toggle-btn"
            onClick={() => setShowSearch(true)}
            title="Search messages"
          >
            🔍
          </button>
          
          {isRoom && (
            <button 
              className="settings-btn"
              onClick={() => setShowRoomSettings(true)}
              title="Group settings"
            >
              ⚙️
            </button>
          )}
        </div>
      </div>

      {/* Messages Area - Simple scrollable container */}
      <div className="messages-container" ref={messagesContainerRef}>
        {loading ? (
          <LoadingSpinner message="Loading messages..." />
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation! 👋</p>
          </div>
        ) : (
          <MessageList 
            messages={messages}
            currentUserId={currentUser._id}
          />
        )}
        
        {isTyping && (
          <div className="typing-indicator">
            <span>{isRoom ? 'Someone' : chatTarget.username} is typing</span>
            <span className="dots">
              <span>.</span><span>.</span><span>.</span>
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onFileMessage={handleFileMessage}
      />

      {/* Search Modal */}
      {showSearch && (
        <SearchMessages
          messages={messages}
          onResultClick={(msg) => {
            // TODO: Implement scroll to message functionality
          }}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Room Settings Modal */}
      {showRoomSettings && isRoom && (
        <RoomSettings
          room={chatTarget}
          onClose={() => setShowRoomSettings(false)}
          onRoomUpdated={(updatedRoom) => {
            // Room updated - refresh room data if needed
          }}
          onRoomDeleted={(roomId) => {
            setShowRoomSettings(false);
            if (onRoomDeleted) {
              onRoomDeleted(roomId);
            }
          }}
        />
      )}
    </div>
  );
};

export default ChatWindow;