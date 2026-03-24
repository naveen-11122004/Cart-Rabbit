import React, { useState } from 'react';
import axios from 'axios';
import './PINVerificationModal.css';

const API = import.meta.env.VITE_API_URL;

const PINVerificationModal = ({ isOpen, onClose, chatUserId, chatUsername, onVerified }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!pin) {
      setError('Please enter PIN');
      return;
    }

    setVerifying(true);

    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userData.token;

      if (!token) {
        setError('Session expired. Please login again.');
        return;
      }

      await axios.post(
        `${API}/api/users/chat-verify-lock`,
        { chatUserId, pin },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPin('');
      onVerified(true);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify PIN');
    } finally {
      setVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pin-verification-overlay">
      <div className="pin-verification-modal">
        <div className="pin-modal-header">
          <h3>🔒 Enter PIN</h3>
          <button className="pin-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="pin-modal-body">
          <p className="pin-chat-name">{chatUsername}</p>
          <p className="pin-subtitle">This chat is locked. Enter PIN to access.</p>

          <form onSubmit={handleVerify}>
            <div className="pin-form-group">
              <input
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                maxLength="6"
                disabled={verifying}
                autoFocus
              />
            </div>

            {error && <div className="pin-error-message">{error}</div>}

            <button
              type="submit"
              className="pin-verify-btn"
              disabled={verifying}
            >
              {verifying ? 'Verifying...' : 'Verify PIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PINVerificationModal;
