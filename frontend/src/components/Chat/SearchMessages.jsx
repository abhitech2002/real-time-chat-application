import { useState } from 'react';
import './Chat.css';

const SearchMessages = ({ messages, onResultClick, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    
    if (!value.trim()) {
      setResults([]);
      return;
    }

    const filtered = messages.filter(msg => 
      msg.content.toLowerCase().includes(value.toLowerCase())
    );
    setResults(filtered);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="search-overlay">
      <div className="search-modal">
        <div className="search-header">
          <h3>Search Messages</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for messages..."
            className="search-messages-input"
            autoFocus
          />
        </div>

        <div className="search-results">
          {searchTerm && results.length === 0 ? (
            <div className="no-results">
              <p>No messages found for "{searchTerm}"</p>
            </div>
          ) : (
            results.map(msg => (
              <div
                key={msg._id}
                className="search-result-item"
                onClick={() => {
                  onResultClick(msg);
                  onClose();
                }}
              >
                <div className="result-sender">
                  <img src={msg.sender.avatar} alt={msg.sender.username} />
                  <span>{msg.sender.username}</span>
                </div>
                <div className="result-content">{msg.content}</div>
                <div className="result-time">{formatTime(msg.createdAt)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchMessages;