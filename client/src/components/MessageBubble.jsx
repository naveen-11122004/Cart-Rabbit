import React, { useState, useRef, useEffect } from 'react';
import './MessageBubble.css';

const API = import.meta.env.VITE_API_URL;

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MessageBubble = ({ 
  message, 
  isSent, 
  timestamp,
  onReply,
  onStar,
  onForward,
  onEdit,
  onDelete
}) => {
  const [imgError, setImgError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptions]);

  const toggleOptions = (e) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  const hasFile = message.file && message.file.mimetype;
  const fileUrl = `${API}/api/messages/file/${message._id}`;

  const renderFileContent = () => {
    const { mimetype, filename, size } = message.file;

    if (mimetype.startsWith('image/') && !imgError) {
      return (
        <div className="file-content image-content">
          <a href={fileUrl} target="_blank" rel="noreferrer" download={filename}>
            <img
              src={fileUrl}
              alt={filename}
              className="msg-image"
              onError={() => setImgError(true)}
            />
          </a>
          {message.content && !message.content.startsWith('Sent a ') && (
            <p className="caption-text">{message.content}</p>
          )}
        </div>
      );
    }

    if (mimetype.startsWith('video/')) {
      return (
        <div className="file-content video-content">
          <video
            src={fileUrl}
            controls
            className="msg-video"
            preload="metadata"
          />
          {message.content && !message.content.startsWith('Sent a ') && (
            <p className="caption-text">{message.content}</p>
          )}
        </div>
      );
    }

    // Document / PDF
    return (
      <div className="file-content doc-content">
        <div className="doc-icon">📄</div>
        <div className="doc-info">
          <span className="doc-name">{filename}</span>
          {size && <span className="doc-size">{formatSize(size)}</span>}
        </div>
        <a
          href={fileUrl}
          download={filename}
          target="_blank"
          rel="noreferrer"
          className="doc-download-btn"
          title="Download"
        >
          ⬇
        </a>
      </div>
    );
  };

  return (
    <div className={`message-bubble-container ${isSent ? 'sent' : 'received'}`}>
      <div className={`message-bubble ${isSent ? 'sent' : 'received'} ${hasFile ? 'has-file' : ''}`}>
        {hasFile ? (
          renderFileContent()
        ) : (
          <p className="message-text">{message.content}</p>
        )}
        <span className="message-timestamp">{formatTime(timestamp)}</span>

        {isSent && (
          <div className="message-options-wrapper" ref={optionsRef}>
            <button className="message-options-btn" onClick={toggleOptions}>
              ⌄
            </button>
            {showOptions && (
              <div className="message-options-menu">
                <button className="msg-opt-item" onClick={(e) => { e.stopPropagation(); setShowOptions(false); onReply && onReply(message); }}>↩ Reply</button>
                <button className="msg-opt-item" onClick={(e) => { e.stopPropagation(); setShowOptions(false); onStar && onStar(message._id); }}>⭐ {message.starredBy?.includes(message.senderId) ? 'Unstar' : 'Star'}</button>
                <button className="msg-opt-item" onClick={(e) => { e.stopPropagation(); setShowOptions(false); onForward && onForward(message); }}>➡ Forward</button>
                <button className="msg-opt-item" onClick={(e) => { e.stopPropagation(); setShowOptions(false); onEdit && onEdit(message); }}>✏ Edit</button>
                <button className="msg-opt-item delete-opt" onClick={(e) => { e.stopPropagation(); setShowOptions(false); onDelete && onDelete(message._id); }}>🗑 Delete</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
