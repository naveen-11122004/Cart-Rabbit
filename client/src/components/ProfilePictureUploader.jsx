import React, { useState, useRef } from 'react';
import axios from 'axios';
import './ProfilePictureUploader.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ProfilePictureUploader = ({ onPictureUpdate, currentPicture, displayName, username }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(currentPicture || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target.result;
      setPreview(base64Image);

      // Upload to server
      await uploadProfilePicture(base64Image);
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsDataURL(file);
  };

  const uploadProfilePicture = async (base64Image) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('User not found. Please login again.');
        return;
      }

      const user = JSON.parse(userStr);
      const token = user.token;

      const response = await axios.post(
        `${API_BASE_URL}/users/profile-picture`,
        { profilePicture: base64Image },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess('Profile picture updated successfully!');
      
      // Update local storage with new picture
      const updatedUser = { ...user, profilePicture: base64Image };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Force update with callback
      if (onPictureUpdate) {
        onPictureUpdate(base64Image);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Profile picture upload error:', err);
      const errorMsg =
        err.response?.data?.message || 'Failed to upload profile picture';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClearPicture = async () => {
    if (!currentPicture && !preview) return;

    try {
      setLoading(true);
      setError('');

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('User not found. Please login again.');
        return;
      }

      const user = JSON.parse(userStr);
      const token = user.token;

      await axios.post(
        `${API_BASE_URL}/users/profile-picture`,
        { profilePicture: null },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setPreview(null);
      setSuccess('Profile picture removed successfully!');
      if (onPictureUpdate) {
        onPictureUpdate(null);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Profile picture removal error:', err);
      setError('Failed to remove profile picture');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-picture-uploader">
      <div className="profile-picture-container">
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            className="profile-picture-preview"
            title={displayName || username}
          />
        ) : (
          <div className="profile-picture-placeholder">
            {(displayName || username || 'U')[0].toUpperCase()}
          </div>
        )}
      </div>

      <div className="profile-picture-actions">
        <button
          className="profile-picture-btn upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          title="Upload profile picture"
        >
          📷 {loading ? 'Uploading...' : 'Upload Photo'}
        </button>

        {(currentPicture || preview) && (
          <button
            className="profile-picture-btn remove-btn"
            onClick={handleClearPicture}
            disabled={loading}
            title="Remove profile picture"
          >
            🗑️ {loading ? 'Removing...' : 'Remove'}
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={loading}
          hidden
        />
      </div>

      {error && <div className="profile-picture-error">{error}</div>}
      {success && <div className="profile-picture-success">{success}</div>}

      <div className="profile-picture-hint">
        📸 Max size: 5MB. Supported: JPG, PNG, GIF, WebP
      </div>
    </div>
  );
};

export default ProfilePictureUploader;
