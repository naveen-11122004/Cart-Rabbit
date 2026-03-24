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
  onDelete,
  onJoinCall
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

  const {
    _id,
    content,
    senderId,
    messageType = 'text',
    file,
    status,
    isStarred,
    isEdited
  } = message;

  const renderContent = () => {
    if (messageType === 'scheduled_call') {
      try {
        const callData = JSON.parse(content);
        
        // Helper to format time like "8:00 pm"
        const formatTimeRange = (dateStr) => {
          if (!dateStr) return '';
          return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }).toLowerCase();
        };

        const startDate = new Date(callData.startTime);
        const dayLabel = startDate.toDateString() === new Date().toDateString() ? 'Today' : startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeRangeStr = `${dayLabel}, ${formatTimeRange(callData.startTime)} - ${formatTimeRange(callData.endTime)}`;

        return (
          <div className="whatsapp-schedule-bubble">
            <div className="schedule-bubble-header">
              <div className="calendar-icon-box">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#008069">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                </svg>
              </div>
              <div className="schedule-bubble-info">
                <div className="schedule-title">{callData.title}</div>
                <div className="schedule-time">{timeRangeStr}</div>
              </div>
            </div>
            
            <div className="schedule-body-text">
              <p>WhatsApp {callData.callType} call</p>
              <div className="going-status">
                <div className="going-avatar-mini">{senderId?.username?.[0] || 'U'}</div>
                <span>1 going</span>
              </div>
            </div>

            <div className="schedule-divider"></div>
            
            <button className="whatsapp-join-btn" onClick={() => onJoinCall && onJoinCall(callData)}>
              Join call
            </button>
          </div>
        );
      } catch (e) {
        return <p className="message-text">Invalid meeting link</p>;
      }
    }

    if (file && file.mimetype) {
      const fileUrl = `${API}/api/messages/file/${_id}`;
      const { mimetype, filename } = file;

      if (mimetype.startsWith('image/')) {
        return (
          <div className="file-content image-content">
            <img src={fileUrl} alt={filename} className="msg-image" />
            {content && !content.startsWith('Sent a ') && <p className="caption-text">{content}</p>}
          </div>
        );
      }

      if (mimetype.startsWith('video/')) {
        return (
          <div className="file-content video-content">
            <video src={fileUrl} controls className="msg-video" />
            {content && !content.startsWith('Sent a ') && <p className="caption-text">{content}</p>}
          </div>
        );
      }

      return (
        <div className="file-content doc-content">
          <div className="doc-icon">📄</div>
          <div className="doc-info">
            <span className="doc-name">{filename}</span>
            <span className="doc-size">{formatSize(file.size)}</span>
          </div>
          <a href={fileUrl} download={filename} className="doc-download-btn">⬇</a>
        </div>
      );
    }

    return (
      <p className="message-text">
        {content}
        {isEdited && <span className="edited-badge"> (edited)</span>}
      </p>
    );
  };

  return (
    <div className={`message-bubble-container ${isSent ? 'sent' : 'received'}`}>
      <div className={`message-bubble ${isSent ? 'sent' : 'received'} ${messageType === 'scheduled_call' ? 'call-type' : ''}`}>
        {renderContent()}
        
        <div className="message-meta">
          <span className="message-timestamp">{formatTime(timestamp)}</span>
          {isSent && (
            <span className={`status-icon ${status}`}>
              {status === 'viewed' ? '✓✓' : status === 'delivered' ? '✓✓' : '✓'}
            </span>
          )}
        </div>

        <div className="message-options-wrapper" ref={optionsRef}>
          <button className="message-options-btn" onClick={toggleOptions}>⌄</button>
          {showOptions && (
            <div className="message-options-menu">
              <button className="msg-opt-item" onClick={() => onReply && onReply(message)}>↩ Reply</button>
              <button className="msg-opt-item" onClick={() => onStar && onStar(_id)}>⭐ Star</button>
              <button className="msg-opt-item" onClick={() => onForward && onForward(message)}>➡ Forward</button>
              {isSent && <button className="msg-opt-item" onClick={() => onEdit && onEdit(message)}>✏ Edit</button>}
              <button className="msg-opt-item delete-opt" onClick={() => onDelete && onDelete(_id)}>🗑 Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
