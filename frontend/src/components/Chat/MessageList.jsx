import { memo } from 'react';
import ReadReceipt from './ReadReceipt';
import './Chat.css';

const MessageList = memo(({ messages, currentUserId }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      const dateKey = new Date(message.createdAt).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="message-list">
      {Object.entries(messageGroups).map(([dateKey, dayMessages]) => (
        <div key={dateKey}>
          <div className="date-divider">
            <span>{formatDate(dayMessages[0].createdAt)}</span>
          </div>
          
          {dayMessages.map((message, index) => {
            const isOwn = message.sender._id === currentUserId;
            const showAvatar = !isOwn && (
              index === dayMessages.length - 1 || 
              dayMessages[index + 1]?.sender._id !== message.sender._id
            );

            return (
              <div
                key={message._id || `${message.sender._id}-${index}`}
                className={`message ${isOwn ? 'message-own' : 'message-other'}`}
              >
                {!isOwn && showAvatar && (
                  <img 
                    src={message.sender.avatar} 
                    alt={message.sender.username}
                    className="message-avatar"
                  />
                )}
                {!isOwn && !showAvatar && <div className="message-avatar-spacer"></div>}
                
                <div className="message-content">
                  {!isOwn && showAvatar && (
                    <span className="message-sender">{message.sender.username}</span>
                  )}
                  <div className="message-bubble">
                    {message.messageType === 'image' ? (
                      <div className="message-image">
                        <img src={message.fileUrl} alt="Shared image" />
                        {message.content && <p>{message.content}</p>}
                      </div>
                    ) : message.messageType === 'file' ? (
                      <div className="message-file">
                        <div className="file-icon">📎</div>
                        <div className="file-info">
                          <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                            {message.fileName || 'Download File'}
                          </a>
                          {message.fileSize && (
                            <span className="file-size">
                              {(message.fileSize / 1024).toFixed(2)} KB
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                  <div className="message-meta">
                    <span className="message-time">{formatTime(message.createdAt)}</span>
                    <ReadReceipt message={message} isOwn={isOwn} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;