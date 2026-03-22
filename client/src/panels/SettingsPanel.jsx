import React, { useState, useEffect } from 'react';
import './Panel.css';
import './SettingsPanel.css';

const SettingsPanel = ({ user }) => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('wa_dark') === 'true');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('wa_font_size') || 'medium');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('wa_notifications') !== 'false');
  const [sounds, setSounds] = useState(() => localStorage.getItem('wa_sounds') !== 'false');
  const [enterToSend, setEnterToSend] = useState(() => localStorage.getItem('wa_enter_send') === 'true');

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('wa_dark', darkMode);
  }, [darkMode]);

  // Apply font size
  useEffect(() => {
    const sizes = { small: '13px', medium: '15px', large: '17px' };
    document.documentElement.style.setProperty('--chat-font-size', sizes[fontSize] || '15px');
    localStorage.setItem('wa_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => { localStorage.setItem('wa_notifications', notifications); }, [notifications]);
  useEffect(() => { localStorage.setItem('wa_sounds', sounds); }, [sounds]);
  useEffect(() => { localStorage.setItem('wa_enter_send', enterToSend); }, [enterToSend]);

  const Toggle = ({ checked, onChange }) => (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );

  return (
    <div className="panel settings-panel">
      <div className="panel-header">
        <h2>Settings</h2>
      </div>

      <div className="panel-body">
        {/* Account card */}
        <div className="settings-account-card">
          <div className="settings-account-avatar">
            {(user?.username || 'U')[0].toUpperCase()}
          </div>
          <div className="settings-account-info">
            <span className="settings-account-name">{user?.username || 'User'}</span>
            <span className="settings-account-email">{user?.email || ''}</span>
          </div>
        </div>

        <hr className="panel-divider" />

        {/* Appearance */}
        <div className="panel-section-label">Appearance</div>

        <div className="settings-row">
          <div className="settings-row-icon" style={{ background: darkMode ? '#1a1a2e' : '#f0f2f5' }}>
            {darkMode ? '🌙' : '☀️'}
          </div>
          <div className="settings-row-body">
            <span className="settings-row-title">Dark Mode</span>
            <span className="settings-row-sub">{darkMode ? 'On' : 'Off'}</span>
          </div>
          <Toggle checked={darkMode} onChange={setDarkMode} />
        </div>

        <div className="settings-row">
          <div className="settings-row-icon">🔤</div>
          <div className="settings-row-body">
            <span className="settings-row-title">Chat Font Size</span>
            <div className="settings-font-btns">
              {['small','medium','large'].map(s => (
                <button
                  key={s}
                  className={`settings-font-btn ${fontSize === s ? 'active' : ''}`}
                  onClick={() => setFontSize(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <hr className="panel-divider" />

        {/* Notifications */}
        <div className="panel-section-label">Notifications</div>

        <div className="settings-row">
          <div className="settings-row-icon">🔔</div>
          <div className="settings-row-body">
            <span className="settings-row-title">Notifications</span>
            <span className="settings-row-sub">{notifications ? 'Enabled' : 'Disabled'}</span>
          </div>
          <Toggle checked={notifications} onChange={setNotifications} />
        </div>

        <div className="settings-row">
          <div className="settings-row-icon">🔊</div>
          <div className="settings-row-body">
            <span className="settings-row-title">Message Sounds</span>
            <span className="settings-row-sub">{sounds ? 'On' : 'Muted'}</span>
          </div>
          <Toggle checked={sounds} onChange={setSounds} />
        </div>

        <hr className="panel-divider" />

        {/* Chat settings */}
        <div className="panel-section-label">Chats</div>

        <div className="settings-row">
          <div className="settings-row-icon">⌨️</div>
          <div className="settings-row-body">
            <span className="settings-row-title">Enter to Send</span>
            <span className="settings-row-sub">Press Enter to send messages</span>
          </div>
          <Toggle checked={enterToSend} onChange={setEnterToSend} />
        </div>

        <hr className="panel-divider" />

        {/* About */}
        <div className="panel-section-label">About</div>
        <div className="settings-about">
          <div className="settings-about-logo">💬</div>
          <div className="settings-about-app">WhatsApp Clone</div>
          <div className="settings-about-version">Version 1.0.0</div>
          <div className="settings-about-stack">
            Built with React 18 · Node.js · MongoDB · Socket.IO · WebRTC
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
