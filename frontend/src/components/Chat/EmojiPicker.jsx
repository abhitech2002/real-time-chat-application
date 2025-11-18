import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import './Chat.css';

const EmojiPickerComponent = ({ onEmojiClick }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const handleEmojiClick = (emojiData) => {
    onEmojiClick(emojiData.emoji);
    setShowPicker(false);
  };

  return (
    <div className="emoji-picker-container" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className="emoji-btn"
        title="Add emoji"
      >
        😊
      </button>
      
      {showPicker && (
        <div className="emoji-picker-wrapper">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={400}
            searchDisabled
            skinTonesDisabled
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerComponent;