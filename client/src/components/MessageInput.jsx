import React, { useState, useRef, useEffect } from 'react';
import AudioRecorder from './AudioRecorder';
import PollCreator from './PollCreator';
import EventCreator from './EventCreator';
import StickerPicker from './StickerPicker';
import ContactPicker from './ContactPicker';
import './MessageInput.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'];
const MAX_SIZE = 50 * 1024 * 1024; // 50MB

const EMOJI_LIST = ['😀','😂','🤣','😍','🥰','😊','😁','😎','🥺','😭','😡','🤯','👍','👎','👏','🤝','🔥','❤️','✨','🎉'];

const SVGIcon = ({ d, viewBox = "0 0 24 24", fill = "currentColor", size = 24 }) => (
  <svg viewBox={viewBox} width={size} height={size} fill={fill}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const MessageInput = ({ 
  onSendMessage, 
  onSendFile,
  onSendAudio,
  isLoading,
  replyingToMessage,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  currentUserId
}) => {
  const [message, setMessage] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [showEventCreator, setShowEventCreator] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowAttachMenu(false);
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pre-fill input if editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content || '');
    } else if (replyingToMessage === null && editingMessage === null && !filePreview) {
      setMessage('');
    }
  }, [editingMessage]);

  const handleSendText = () => {
    if (message.trim() === '') return;
    onSendMessage(message);
    setMessage('');
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (filePreview) handleSendFile();
      else handleSendText();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only images, videos (mp4), and PDFs are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError('File size must be under 50 MB.');
      e.target.value = '';
      return;
    }

    const type = file.type.startsWith('image/') ? 'image'
      : file.type.startsWith('video/') ? 'video'
      : 'document';

    const url = type !== 'document' ? URL.createObjectURL(file) : null;
    setFilePreview({ file, url, type, name: file.name });
    e.target.value = '';
    setShowAttachMenu(false);
  };

  const handleSendFile = () => {
    if (!filePreview) return;
    onSendFile(filePreview.file);
    if (filePreview.url) URL.revokeObjectURL(filePreview.url);
    setFilePreview(null);
  };

  const handleCancelFile = () => {
    if (filePreview?.url) URL.revokeObjectURL(filePreview.url);
    setFilePreview(null);
    setFileError('');
  };

  const handleAudioSend = (audioBlob) => {
    if (onSendAudio) {
      onSendAudio(audioBlob);
    }
    setShowAudioRecorder(false);
  };

  const handlePollSend = (pollData) => {
    onSendMessage(JSON.stringify(pollData), 'poll');
    setShowPollCreator(false);
  };

  const handleEventSend = (eventData) => {
    onSendMessage(JSON.stringify(eventData), 'event');
    setShowEventCreator(false);
  };

  const handleStickerSend = (stickerData) => {
    onSendMessage(JSON.stringify(stickerData), 'sticker');
    setShowStickerPicker(false);
  };

  const handleContactSend = (contactData) => {
    onSendMessage(JSON.stringify(contactData), 'contact');
    setShowContactPicker(false);
  };

  return (
    <div className="input-area" ref={containerRef}>
      {/* Reply Preview Strip */}
      {replyingToMessage && !editingMessage && (
        <div className="reply-preview-strip">
          <div className="reply-preview-content">
            <span className="reply-preview-title">Replying to message</span>
            <span className="reply-preview-text">{replyingToMessage.content}</span>
          </div>
          <button className="preview-cancel" onClick={onCancelReply}>✕</button>
        </div>
      )}

      {/* Edit Preview Strip */}
      {editingMessage && (
        <div className="reply-preview-strip edit-strip">
          <div className="reply-preview-content">
            <span className="reply-preview-title">Editing message</span>
            <span className="reply-preview-text">{editingMessage.content}</span>
          </div>
          <button className="preview-cancel" onClick={() => { onCancelEdit(); setMessage(''); }}>✕</button>
        </div>
      )}
      {/* File preview strip */}
      {filePreview && (
        <div className="file-preview-strip">
          {filePreview.type === 'image' && <img src={filePreview.url} alt="preview" className="preview-thumb" />}
          {filePreview.type === 'video' && <video src={filePreview.url} className="preview-thumb" muted />}
          {filePreview.type === 'document' && <div className="preview-doc-icon">📄</div>}
          <div className="preview-file-info">
            <span className="preview-filename">{filePreview.name}</span>
            <span className="preview-hint">Press Send or Enter to send</span>
          </div>
          <button className="preview-cancel" onClick={handleCancelFile}>✕</button>
        </div>
      )}

      {fileError && <div className="file-error">{fileError}</div>}

      <div className="message-input-container">
        
        {/* Hidden popup menus */}
        {showAttachMenu && (
          <div className="attach-menu">
            <button className="attach-menu-item" onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}>
              <span className="attach-icon" style={{background: '#7f66ff'}}>
                <SVGIcon d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z" viewBox="0 0 24 24" fill="white" size={18} />
              </span> Document
            </button>
            <button className="attach-menu-item" onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}>
              <span className="attach-icon" style={{background: '#007bfc'}}>
                <SVGIcon d="M21 4H3C1.9 4 1 4.9 1 6v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" viewBox="0 0 24 24" fill="white" size={18} />
              </span> Photos & videos
            </button>
            <button className="attach-menu-item" onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}>
              <span className="attach-icon" style={{background: '#ff1d53'}}>
                <SVGIcon d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="white" size={18} />
              </span> Camera
            </button>
            <button className="attach-menu-item" onClick={() => { setShowAttachMenu(false); setShowAudioRecorder(true); }}>
              <span className="attach-icon" style={{background: '#ff7b00'}}>
                <SVGIcon d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h3v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-3v8h3c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9z" fill="white" size={18} />
              </span> Audio
            </button>
            <button className="attach-menu-item" onClick={() => { setShowAttachMenu(false); setShowContactPicker(true); }}>
              <span className="attach-icon" style={{background: '#009de2'}}>
                <SVGIcon d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white" size={18} />
              </span> Contact
            </button>
            <button className="attach-menu-item" onClick={() => { setShowAttachMenu(false); setShowPollCreator(true); }}>
              <span className="attach-icon" style={{background: '#00c7a5'}}>
                <SVGIcon d="M3 3v18h18V3H3zm6 14H7v-5h2v5zm4 0h-2V7h2v10zm4 0h-2v-3h2v3z" fill="white" size={18} />
              </span> Poll
            </button>
            <button className="attach-menu-item" onClick={() => { setShowAttachMenu(false); setShowEventCreator(true); }}>
              <span className="attach-icon" style={{background: '#0bb9ea'}}>
                <SVGIcon d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" fill="white" size={18} />
              </span> Event
            </button>
            <button className="attach-menu-item" onClick={() => { setShowAttachMenu(false); setShowStickerPicker(true); }}>
              <span className="attach-icon" style={{background: '#0bb9ea'}}>
                <SVGIcon d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="white" size={18} />
              </span> New sticker
            </button>
          </div>
        )}

        {showEmojiPicker && (
          <div className="emoji-picker">
            {EMOJI_LIST.map(emoji => (
              <button key={emoji} className="emoji-item" onClick={() => setMessage(prev => prev + emoji)}>
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".jpg,.jpeg,.png,.gif,.mp4,.pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Action icons (Emoji + Attach) */}
        <button className="wa-icon-btn" title="Emoji" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachMenu(false); }}>
          <SVGIcon viewBox="0 0 24 24" size={26} fill="#54656f" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm4.156-5.467c-.22.257-.6.287-.857.067C14.739 14.12 13.439 13.7 12 13.7c-1.439 0-2.739.42-3.299.9-.257.22-.637.19-.857-.067-.22-.257-.19-.637.067-.857C8.653 13.044 10.22 12.5 12 12.5c1.78 0 3.347.544 4.089 1.176.257.22.287.6.067.857zM8.5 11c.828 0 1.5-.672 1.5-1.5S9.328 8 8.5 8 7 8.672 7 9.5 7.672 11 8.5 11zm7 0c.828 0 1.5-.672 1.5-1.5S16.328 8 15.5 8 14 8.672 14 9.5 14.672 11 15.5 11z" />
        </button>

        <button className="wa-icon-btn" title="Attach Menu" onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); }} disabled={isLoading}>
          <SVGIcon viewBox="0 0 24 24" size={28} fill="#54656f" d="M12 20.25a.75.75 0 0 1-.75-.75V12.75H4.25a.75.75 0 0 1 0-1.5h7V4.25a.75.75 0 0 1 1.5 0v7h7a.75.75 0 0 1 0 1.5h-7v7a.75.75 0 0 1-.75.75z" />
        </button>

        <input
          type="text"
          className="message-input"
          placeholder={filePreview ? 'Add a caption (optional)...' : 'Type a message'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />

        {message.trim().length > 0 || filePreview ? (
          <button className="send-button-svg" onClick={filePreview ? handleSendFile : handleSendText} disabled={isLoading}>
            <SVGIcon viewBox="0 0 24 24" size={24} fill="#54656f" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
          </button>
        ) : (
          <button className="wa-icon-btn-microphone" disabled>
             <SVGIcon viewBox="0 0 24 24" size={24} fill="#54656f" d="M11.999 15.688c2.091 0 3.738-1.536 3.738-3.46v-5.594c0-1.928-1.647-3.464-3.738-3.464-2.094 0-3.744 1.536-3.744 3.464v5.594c0 1.924 1.65 3.46 3.744 3.46zm-5.118-3.951c0-2.062 1.681-3.732 3.744-3.732 2.059 0 3.738 1.67 3.738 3.732v.223h-7.482v-.223zm10.742-1.993v2.015c0 3.037-2.396 5.539-5.385 5.864v2.716h-4.786v-2.72c-2.981-.33-5.385-2.83-5.385-5.864v-2.01c0-.414.336-.75.75-.75s.75.336.75.75v2.014c0 2.378 1.936 4.316 4.316 4.316s4.315-1.938 4.315-4.316v-2.015c0-.414.336-.75.75-.75s.75.336.75.75z" />
          </button>
        )}
      </div>

      {/* Modal Components */}
      {showAudioRecorder && (
        <AudioRecorder 
          onSendAudio={handleAudioSend} 
          onClose={() => setShowAudioRecorder(false)} 
        />
      )}

      {showPollCreator && (
        <PollCreator 
          onSendPoll={handlePollSend} 
          onClose={() => setShowPollCreator(false)} 
        />
      )}

      {showEventCreator && (
        <EventCreator 
          onSendEvent={handleEventSend} 
          onClose={() => setShowEventCreator(false)} 
        />
      )}

      {showStickerPicker && (
        <StickerPicker 
          onSendSticker={handleStickerSend} 
          onClose={() => setShowStickerPicker(false)} 
        />
      )}

      {showContactPicker && (
        <ContactPicker 
          onSendContact={handleContactSend}
          onClose={() => setShowContactPicker(false)}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default MessageInput;
