import './Chat.css';

const MessageList = ({ messages, currentUserId }) => {
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
                key={message._id}
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
                    <p>{message.content}</p>
                  </div>
                  <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MessageList;