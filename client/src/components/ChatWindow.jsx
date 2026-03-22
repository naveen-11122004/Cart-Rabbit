import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const ChatWindow = ({ 
  messages, 
  selectedUser, 
  onSendMessage, 
  onSendFile, 
  isLoading, 
  currentUserId, 
  onStartCall,
  onReply,
  onStar,
  onForward,
  onEdit,
  onDelete,
  replyingToMessage,
  onCancelReply,
  editingMessage,
  onCancelEdit
}) => {
  const [showCallMenu, setShowCallMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const callMenuRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (callMenuRef.current && !callMenuRef.current.contains(event.target)) {
        setShowCallMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selectedUser) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h2>WhatsApp Web</h2>
          <p>Send and receive messages to stay connected with people.</p>
        </div>
      </div>
    );
  }

  const startVoiceCall = () => {
    setShowCallMenu(false);
    onStartCall('voice');
  };

  const startVideoCall = () => {
    setShowCallMenu(false);
    onStartCall('video');
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-avatar">
          {selectedUser.username.charAt(0).toUpperCase()}
        </div>
        <div className="chat-header-info">
          <h3>{selectedUser.username}</h3>
          <p className="header-status">online</p>
        </div>
        
        <div className="chat-header-actions" ref={callMenuRef}>
          <button 
            className="call-btn-pill" 
            onClick={() => setShowCallMenu(!showCallMenu)}
          >
            <span className="video-icon" style={{ fontSize: '13px' }}>📹</span>
            <span className="call-text">Call</span>
            <span className="dropdown-arrow" style={{ fontSize: '10px' }}>▼</span>
          </button>
          
          <button className="header-icon-btn">🔍</button>
          <button className="header-icon-btn">⋮</button>

          {showCallMenu && (
            <div className="call-dropdown-menu">
              <div className="call-dropdown-header">
                <div className="call-avatar-small">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="call-dropdown-name">{selectedUser.username}</span>
              </div>
              
              <div className="call-action-buttons">
                <button className="call-action-btn green-btn" onClick={startVoiceCall}>
                  📞 Voice
                </button>
                <button className="call-action-btn green-btn" onClick={startVideoCall}>
                  📹 Video
                </button>
              </div>
              
              <div className="call-dropdown-links">
                <button className="call-link-item"><span className="link-icon">➕</span> New group call</button>
                <button className="call-link-item"><span className="link-icon">🔗</span> Send call link</button>
                <button className="call-link-item"><span className="link-icon">📅</span> Schedule call</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet.<br />Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isSent={
                typeof msg.senderId === 'object'
                  ? msg.senderId._id === currentUserId
                  : msg.senderId === currentUserId
              }
              timestamp={msg.createdAt}
              onReply={onReply}
              onStar={onStar}
              onForward={onForward}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onSendFile={onSendFile}
        isLoading={isLoading}
        replyingToMessage={replyingToMessage}
        onCancelReply={onCancelReply}
        editingMessage={editingMessage}
        onCancelEdit={onCancelEdit}
      />
    </div>
  );
};

export default ChatWindow;
