import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Panel.css';
import './ProfilePanel.css';
import ProfilePictureUploader from '../components/ProfilePictureUploader';

const MAX_BIO = 139;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ProfilePanel = ({ user }) => {
  const [displayName, setDisplayName] = useState(() =>
    localStorage.getItem('wa_display_name') || user?.username || ''
  );
  const [bio, setBio] = useState(() =>
    localStorage.getItem('wa_bio') || 'Hey there! I am using WhatsApp.'
  );
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  // Fetch profile picture on mount
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        const userObj = JSON.parse(userStr);
        const response = await axios.get(
          `${API_BASE_URL}/users/profile-picture?userId=${userObj._id}`
        );

        if (response.data.profilePicture) {
          setProfilePicture(response.data.profilePicture);
        }
      } catch (error) {
        console.error('Failed to fetch profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, [user]);

  const startEditName = () => { setTempName(displayName); setEditingName(true); };
  const saveName = () => {
    const v = tempName.trim();
    if (v) { setDisplayName(v); localStorage.setItem('wa_display_name', v); }
    setEditingName(false);
  };
  const cancelName = () => setEditingName(false);

  const startEditBio = () => { setTempBio(bio); setEditingBio(true); };
  const saveBio = () => {
    const v = tempBio.trim();
    setBio(v); localStorage.setItem('wa_bio', v);
    setEditingBio(false);
  };
  const cancelBio = () => setEditingBio(false);

  const handleProfilePictureUpdate = (newPicture) => {
    // Force state update with new picture
    setProfilePicture(newPicture);
    // Also update localStorage for persistence
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      userObj.profilePicture = newPicture;
      localStorage.setItem('user', JSON.stringify(userObj));
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="panel profile-panel">
      <div className="panel-header">
        <h2>Profile</h2>
      </div>

      <div className="panel-body">
        {/* Avatar with profile picture uploader */}
        {profilePicture ? (
          <div className="profile-hero">
            <img
              key={`profile-pic-${profilePicture.substring(0, 50)}`}
              src={profilePicture}
              alt="Profile"
              className="profile-avatar-lg-pic"
              title={displayName || user?.username}
            />
          </div>
        ) : (
          <div className="profile-hero">
            <div className="profile-avatar-lg">
              {(displayName || user?.username || 'U')[0].toUpperCase()}
            </div>
          </div>
        )}

        <hr className="panel-divider" />

        {/* Profile picture uploader */}
        <ProfilePictureUploader
          currentPicture={profilePicture}
          onPictureUpdate={handleProfilePictureUpdate}
          displayName={displayName}
          username={user?.username}
        />

        <hr className="panel-divider" />

        {/* Display name */}
        <div className="panel-section-label">Your Name</div>
        <div className="profile-field" onClick={!editingName ? startEditName : undefined}>
          {editingName ? (
            <div className="profile-edit-wrap">
              <input
                className="profile-edit-input"
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                autoFocus
                maxLength={50}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelName(); }}
              />
              <div className="profile-edit-actions">
                <button className="profile-action-btn cancel" onClick={cancelName}>✕</button>
                <button className="profile-action-btn save" onClick={saveName}>✓</button>
              </div>
            </div>
          ) : (
            <div className="profile-field-row">
              <span className="profile-field-value">{displayName}</span>
              <button className="profile-edit-btn" onClick={startEditName} title="Edit name">✏️</button>
            </div>
          )}
          <span className="profile-field-hint">
            This is not your username. This name is visible only to you.
          </span>
        </div>

        <hr className="panel-divider" />

        {/* Bio / About */}
        <div className="panel-section-label">About</div>
        <div className="profile-field" onClick={!editingBio ? startEditBio : undefined}>
          {editingBio ? (
            <div className="profile-edit-wrap">
              <textarea
                className="profile-edit-input"
                value={tempBio}
                onChange={e => setTempBio(e.target.value.slice(0, MAX_BIO))}
                autoFocus
                rows={3}
                onKeyDown={e => { if (e.key === 'Escape') cancelBio(); }}
              />
              <div className="profile-edit-actions">
                <span className="profile-bio-count">{MAX_BIO - tempBio.length}</span>
                <button className="profile-action-btn cancel" onClick={cancelBio}>✕</button>
                <button className="profile-action-btn save" onClick={saveBio}>✓</button>
              </div>
            </div>
          ) : (
            <div className="profile-field-row">
              <span className="profile-field-value">{bio}</span>
              <button className="profile-edit-btn" onClick={startEditBio} title="Edit bio">✏️</button>
            </div>
          )}
        </div>

        <hr className="panel-divider" />

        {/* Read-only fields */}
        <div className="panel-section-label">Account Info</div>

        <div className="profile-info-row">
          <span className="profile-info-label">📧 Email</span>
          <span className="profile-info-value">{user?.email || '—'}</span>
        </div>

        <div className="profile-info-row">
          <span className="profile-info-label">@ Username</span>
          <span className="profile-info-value">@{user?.username || '—'}</span>
        </div>

        {joinedDate && (
          <div className="profile-info-row">
            <span className="profile-info-label">📅 Member since</span>
            <span className="profile-info-value">{joinedDate}</span>
          </div>
        )}

        <div className="profile-footer">
          WhatsApp Clone · Your account is end-to-end encrypted
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
