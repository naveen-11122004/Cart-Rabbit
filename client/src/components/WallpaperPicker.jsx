import React, { useState, useRef } from 'react';
import axios from 'axios';
import './WallpaperPicker.css';

const API = import.meta.env.VITE_API_URL;

const PRESET_WALLPAPERS = [
  { id: 'default', name: 'Default (White)', color: '#ffffff', type: 'color' },
  { id: 'light-blue', name: 'Light Blue', color: '#e3f2fd', type: 'color' },
  { id: 'light-green', name: 'Light Green', color: '#e8f5e9', type: 'color' },
  { id: 'light-gray', name: 'Light Gray', color: '#f5f5f5', type: 'color' },
  { id: 'dark-mode', name: 'Dark Mode', color: '#0d1419', type: 'color' },
  { id: 'gradient1', name: 'Blue Gradient', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', type: 'gradient' },
  { id: 'gradient2', name: 'Sunset', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', type: 'gradient' },
  { id: 'gradient3', name: 'Ocean', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', type: 'gradient' },
  { id: 'gradient4', name: 'Forest', color: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', type: 'gradient' },
];

const WallpaperPicker = ({ currentWallpaper, onSave, onClose }) => {
  const [selectedType, setSelectedType] = useState('preset');
  const [selectedPreset, setSelectedPreset] = useState(currentWallpaper?.presetId || 'default');
  const [blurLevel, setBlurLevel] = useState(currentWallpaper?.blur || 0);
  const [uploadedImage, setUploadedImage] = useState(currentWallpaper?.url || null);
  const [preview, setPreview] = useState(currentWallpaper?.url || null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setUploadedImage(base64);
      setPreview(base64);
      setSelectedType('upload');
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId);
    setSelectedType('preset');
    setUploadedImage(null);
    setPreview(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const wallpaperData = {
        type: selectedType,
        blur: blurLevel,
      };

      if (selectedType === 'preset') {
        const preset = PRESET_WALLPAPERS.find(p => p.id === selectedPreset);
        wallpaperData.presetId = selectedPreset;
        wallpaperData.css = preset.color;
      } else if (selectedType === 'upload') {
        wallpaperData.url = uploadedImage;
      }

      // Get token from localStorage (stored in user object)
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const token = userData.token;

      if (!token) {
        alert('Session expired. Please login again.');
        onClose();
        return;
      }

      // Save to backend
      await axios.post(`${API}/api/users/wallpaper`, wallpaperData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      onSave({
        type: selectedType,
        presetId: selectedType === 'preset' ? selectedPreset : null,
        url: selectedType === 'upload' ? uploadedImage : null,
        blur: blurLevel,
      });
    } catch (error) {
      console.error('Error saving wallpaper:', error);
      alert('Failed to save wallpaper');
    } finally {
      setSaving(false);
    }
  };

  const getPreviewStyle = () => {
    if (selectedType === 'preset') {
      const preset = PRESET_WALLPAPERS.find(p => p.id === selectedPreset);
      return {
        background: preset.color,
        filter: `blur(${blurLevel}px)`,
      };
    } else if (selectedType === 'upload' && preview) {
      return {
        backgroundImage: `url(${preview})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: `blur(${blurLevel}px)`,
      };
    }
    return {};
  };

  return (
    <div className="wallpaper-picker-modal">
      <div className="wallpaper-picker-container">
        <div className="picker-header">
          <h3>🎨 Set Wallpaper</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="picker-content">
          {/* Preview */}
          <div className="preview-section">
            <div className="preview-label">Preview</div>
            <div className="preview-box" style={getPreviewStyle()}>
              <div className="preview-chat-bubble">
                <div className="bubble-text">Hello! This is how your chat will look.</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="picker-tabs">
            <button
              className={`tab-btn ${selectedType === 'preset' ? 'active' : ''}`}
              onClick={() => setSelectedType('preset')}
            >
              🎨 Presets
            </button>
            <button
              className={`tab-btn ${selectedType === 'upload' ? 'active' : ''}`}
              onClick={() => setSelectedType('upload')}
            >
              📤 Upload
            </button>
          </div>

          {/* Content */}
          <div className="picker-options">
            {selectedType === 'preset' && (
              <div className="presets-grid">
                {PRESET_WALLPAPERS.map(preset => (
                  <button
                    key={preset.id}
                    className={`preset-item ${selectedPreset === preset.id ? 'selected' : ''}`}
                    onClick={() => handlePresetSelect(preset.id)}
                    title={preset.name}
                  >
                    <div
                      className="preset-preview"
                      style={{
                        background: preset.color,
                      }}
                    />
                    <span className="preset-name">{preset.name}</span>
                  </button>
                ))}
              </div>
            )}

            {selectedType === 'upload' && (
              <div className="upload-section">
                <button
                  className="upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Choose Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                {uploadedImage && (
                  <div className="upload-status">
                    <span>✓ Image selected</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Blur Control */}
          <div className="blur-control">
            <label>Blur Intensity</label>
            <div className="blur-slider-container">
              <input
                type="range"
                min="0"
                max="10"
                value={blurLevel}
                onChange={(e) => setBlurLevel(Number(e.target.value))}
                className="blur-slider"
              />
              <span className="blur-value">{blurLevel}</span>
            </div>
          </div>
        </div>

        <div className="picker-footer">
          <button className="cancel-btn" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Wallpaper'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WallpaperPicker;
