import './Chat.css';

const ReadReceipt = ({ message, isOwn }) => {
  if (!isOwn) return null; // Only show on sent messages

  const isRead = message.isRead || (message.readBy && message.readBy.length > 0);

  return (
    <span className="read-receipt">
      {isRead ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="read-check"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
          <polyline points="20 6 9 17 4 12" transform="translate(4, 0)"></polyline>
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sent-check"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </span>
  );
};

export default ReadReceipt;