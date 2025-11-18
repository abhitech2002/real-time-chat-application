import { useState, useEffect, useRef } from 'react';
import { messagesAPI, roomsAPI } from '../../utils/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { toast } from 'react-toastify';
import './Chat.css';

const ChatWindow = ({ selectedUser, selectedRoom, currentUser, socket }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIXED: start as false so we don't auto-scroll on first load
  const [isAtBottom, setIsAtBottom] = useState(false);

  const [isTyping, setIsTyping] = useState(false);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Prevent auto-scroll on initial load
  const firstLoad = useRef(true);

  const isRoom = !!selectedRoom;
  const chatTarget = selectedRoom || selectedUser;

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkIfAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    return scrollHeight - scrollTop <= clientHeight + 10;
  };

  const handleScroll = () => {
    setIsAtBottom(checkIfAtBottom());
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatTarget) return;

      setLoading(true);
      try {
        const response = isRoom
          ? await roomsAPI.getRoomMessages(chatTarget._id)
          : await messagesAPI.getMessages(chatTarget._id);

        setMessages(response.data.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatTarget, isRoom]);

  // After messages load, detect real scroll position (DO NOT scroll)
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setIsAtBottom(checkIfAtBottom());
      }, 50);
    }
  }, [loading]);

  // Auto-scroll only after first load
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return; // skip auto-scroll on initial load
    }

    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (message) => {
      const isRelevant = isRoom
        ? message.room === chatTarget._id
        : message.sender._id === chatTarget._id;

      if (isRelevant) {
        setMessages((prev) => {
          const exists = prev.find((m) => m._id === message._id);
          if (exists) return prev;

          requestAnimationFrame(() => {
            if (checkIfAtBottom()) scrollToBottom();
          });

          return [...prev, message];
        });
      }
    });

    socket.on('message-sent', (message) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      scrollToBottom();
    });

    socket.on('user-typing', (data) => {
      const relevant = isRoom
        ? data.roomId === chatTarget._id
        : data.userId === chatTarget._id;
      if (relevant) setIsTyping(true);
    });

    socket.on('user-stopped-typing', (data) => {
      const relevant = isRoom
        ? data.roomId === chatTarget._id
        : data.userId === chatTarget._id;
      if (relevant) setIsTyping(false);
    });

    return () => {
      socket.off('receive-message');
      socket.off('message-sent');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
    };
  }, [socket, chatTarget, isRoom]);

  const handleSendMessage = (content) => {
    if (!content.trim() || !socket) return;

    const messageData = {
      senderId: currentUser._id,
      content: content.trim(),
      messageType: 'text',
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
      fileSize: fileData.size,
    };

    if (isRoom) messageData.roomId = chatTarget._id;
    else messageData.receiverId = chatTarget._id;

    // ensure correct scroll behavior for file messages
    setIsAtBottom(true);
    socket.emit('send-message', messageData);
  };

  const handleTyping = (isTyping) => {
    if (!socket) return;

    const data = { senderId: currentUser._id };
    if (isRoom) data.roomId = chatTarget._id;
    else data.receiverId = chatTarget._id;

    socket.emit(isTyping ? 'typing-start' : 'typing-stop', data);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-user-info">
          <img 
            src={chatTarget.avatar || 'https://via.placeholder.com/150'} 
            alt={chatTarget.name || chatTarget.username || 'User'} 
          />
          <div>
            <h3>{chatTarget.name || chatTarget.username}</h3>
            <span className={!isRoom && chatTarget.isOnline ? 'status-online' : 'status-offline'}>
              {isRoom
                ? `${chatTarget.members?.length || 0} members`
                : chatTarget.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="messages-container" ref={messagesContainerRef}>
        {loading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation! 👋</p>
          </div>
        ) : (
          <MessageList messages={messages} currentUserId={currentUser._id} />
        )}

        {isTyping && (
          <div className="typing-indicator">
            <span>{isRoom ? 'Someone' : chatTarget.username} is typing</span>
            <span className="dots"><span>.</span><span>.</span><span>.</span></span>
          </div>
        )}

        <div ref={messagesEndRef} />

        {!isAtBottom && (
          <button
            className="scroll-to-bottom-btn"
            onClick={() => {
              setIsAtBottom(true);
              scrollToBottom();
            }}
            title="Scroll to bottom"
          >
            ↓
          </button>
        )}
      </div>

      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onFileMessage={handleFileMessage}
      />
    </div>
  );
};

export default ChatWindow;
