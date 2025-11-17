import { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../../utils/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { toast } from 'react-toastify';
import './Chat.css';

const ChatWindow = ({ selectedUser, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch message history
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      
      setLoading(true);
      try {
        const response = await messagesAPI.getMessages(selectedUser._id);
        setMessages(response.data.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on('receive-message', (message) => {
      // Only add message if it's from the selected user
      if (message.sender._id === selectedUser._id) {
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.find(m => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
        scrollToBottom();
      }
    });

    // Listen for message sent confirmation
    socket.on('message-sent', (message) => {
      // Add the confirmed message
      setMessages(prev => {
        // Check if message already exists to prevent duplicates
        const exists = prev.find(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    });

    // Listen for typing indicators
    socket.on('user-typing', (data) => {
      if (data.userId === selectedUser._id) {
        setIsTyping(true);
      }
    });

    socket.on('user-stopped-typing', (data) => {
      if (data.userId === selectedUser._id) {
        setIsTyping(false);
      }
    });

    // Handle errors
    socket.on('message-error', (error) => {
      toast.error(error.message || 'Failed to send message');
    });

    return () => {
      socket.off('receive-message');
      socket.off('message-sent');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      socket.off('message-error');
    };
  }, [socket, selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content) => {
    if (!content.trim() || !socket) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      content: content.trim(),
      messageType: 'text'
    };

    // Just emit the message - no optimistic update
    // We'll add it when we get 'message-sent' event
    socket.emit('send-message', messageData);
  };

  const handleTyping = (isTyping) => {
    if (!socket) return;

    if (isTyping) {
      socket.emit('typing-start', {
        senderId: currentUser._id,
        receiverId: selectedUser._id
      });
    } else {
      socket.emit('typing-stop', {
        senderId: currentUser._id,
        receiverId: selectedUser._id
      });
    }
  };

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <img src={selectedUser.avatar} alt={selectedUser.username} />
          <div>
            <h3>{selectedUser.username}</h3>
            <span className={selectedUser.isOnline ? 'status-online' : 'status-offline'}>
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {loading ? (
          <div className="loading-messages">Loading messages...</div>
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
            <span>{selectedUser.username} is typing</span>
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
      />
    </div>
  );
};

export default ChatWindow;