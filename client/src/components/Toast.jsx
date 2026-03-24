import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, sender, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="toast-notification">
      <div className="toast-content">
        <div className="toast-avatar">
          {sender?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="toast-text">
          <p className="toast-sender">{sender || 'New message'}</p>
          <p className="toast-message">{message}</p>
        </div>
      </div>
      <button className="toast-close" onClick={() => { setIsVisible(false); onClose(); }}>
        ✕
      </button>
    </div>
  );
};

export default Toast;
