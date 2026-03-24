import React, { useState } from 'react';
import axios from 'axios';
import './ChatLockModal.css';

const API = import.meta.env.VITE_API_URL;

const ChatLockModal = ({ isOpen, onClose, chatUserId, chatUsername, onLock, isLocked }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleLock = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!pin || !confirmPin) {
      setError('Please enter PIN in both fields');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (pin.length < 4 || pin.length > 6) {
      setError('PIN must be 4-6 digits');
      return;
    }

    if (!/^\d+$/.test(pin)) {
      setError('PIN must contain only numbers');
      return;
    }

    setSaving(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userData.token;

      if (!token) {
        setError('Session expired. Please login again.');
        return;
      }

      await axios.post(
        `${API}/api/users/chat-lock`,
        { chatUserId, pin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onLock(true);
      setPin('');
      setConfirmPin('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lock chat');
    } finally {
      setSaving(false);
    }
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError('');

    if (!pin) {
      setError('Please enter PIN to unlock');
      return;
    }

    setSaving(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userData.token;

      await axios.post(
        `${API}/api/users/chat-unlock`,
        { chatUserId, pin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onLock(false);
      setPin('');
      setConfirmPin('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unlock chat');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-lock-modal-overlay">
      <div className="chat-lock-modal">
        <div className="lock-modal-header">
          <h3>{isLocked ? '🔓 Unlock Chat' : '🔒 Lock Chat'}</h3>
          <button className="lock-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="lock-modal-body">
          <p className="lock-chat-name">{chatUsername}</p>

          {isLocked ? (
            <form onSubmit={handleUnlock}>
              <div className="lock-form-group">
                <label>Enter PIN to unlock:</label>
                <input
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength="6"
                  disabled={saving}
                  autoFocus
                />
              </div>

              {error && <div className="lock-error-message">{error}</div>}

              <button
                type="submit"
                className="lock-modal-btn unlock-btn"
                disabled={saving}
              >
                {saving ? 'Unlocking...' : '🔓 Unlock'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLock}>
              <div className="lock-form-group">
                <label>Set PIN (4-6 digits):</label>
                <input
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  maxLength="6"
                  disabled={saving}
                  autoFocus
                />
              </div>

              <div className="lock-form-group">
                <label>Confirm PIN:</label>
                <input
                  type="password"
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  maxLength="6"
                  disabled={saving}
                />
              </div>

              {error && <div className="lock-error-message">{error}</div>}

              <button
                type="submit"
                className="lock-modal-btn lock-btn"
                disabled={saving}
              >
                {saving ? 'Locking...' : '🔒 Lock Chat'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLockModal;
