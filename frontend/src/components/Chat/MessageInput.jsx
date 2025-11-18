import { useState, useRef, useEffect } from 'react';
import FileUpload from './FileUpload';
import EmojiPickerComponent from './EmojiPicker';
import './Chat.css';

const MessageInput = ({ onSendMessage, onTyping, onFileMessage }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiClick = (emoji) => {
    const newMessage = message + emoji;
    setMessage(newMessage);
    inputRef.current?.focus();
  };

  const handleFileUploaded = (fileData) => {
    if (onFileMessage) {
      onFileMessage(fileData);
    }
  };

  return (
    <form className="message-input-container" onSubmit={handleSubmit}>
      <div className="message-input-wrapper">
        <FileUpload onFileUploaded={handleFileUploaded} />
        
        <EmojiPickerComponent onEmojiClick={handleEmojiClick} />
        
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="message-input"
        />
        
        <button 
          type="submit" 
          className="send-button"
          disabled={!message.trim()}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default MessageInput;