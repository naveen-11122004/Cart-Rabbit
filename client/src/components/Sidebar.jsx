import React, { useState } from 'react';
import UserAvatar from './UserAvatar';
import './Sidebar.css';

const Sidebar = ({ users, selectedUser, onSelectUser, lastMessages, currentUserId, currentUsername, onLogout }) => {
  const [activeNav, setActiveNav] = useState('chats');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="wa-layout">
      {/* ── Far-left icon nav ── */}
      <nav className="wa-nav">
        <div className="wa-nav-top">
          <button
            className={`wa-nav-btn ${activeNav === 'chats' ? 'active' : ''}`}
            onClick={() => setActiveNav('chats')}
            title="Chats"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            <span>Chats</span>
          </button>

          <button
            className={`wa-nav-btn ${activeNav === 'status' ? 'active' : ''}`}
            onClick={() => setActiveNav('status')}
            title="Status"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="4"/>
            </svg>
            <span>Status</span>
          </button>

          <button
            className={`wa-nav-btn ${activeNav === 'communities' ? 'active' : ''}`}
            onClick={() => setActiveNav('communities')}
            title="Communities"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <span>Communities</span>
          </button>

          <button
            className={`wa-nav-btn ${activeNav === 'calls' ? 'active' : ''}`}
            onClick={() => setActiveNav('calls')}
            title="Calls"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <span>Calls</span>
          </button>
        </div>

        <div className="wa-nav-bottom">
          <button className="wa-nav-btn" title="Settings" onClick={() => setActiveNav('settings')}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
            <span>Settings</span>
          </button>

          <button className="wa-nav-btn wa-nav-logout" onClick={onLogout} title="Logout">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            <span>Logout</span>
          </button>

          <div className="wa-nav-avatar">
            <UserAvatar username={currentUsername || '?'} size="sm" />
          </div>
        </div>
      </nav>

      {/* ── Main sidebar panel ── */}
      <div className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">Chats</h2>
          <div className="sidebar-header-actions">
            <button className="sidebar-icon-btn" title="New chat">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"/>
              </svg>
            </button>
            <button className="sidebar-icon-btn" title="Menu">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="sidebar-search">
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search or start new chat"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs">
          <button className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
          <button className={`filter-tab ${activeFilter === 'unread' ? 'active' : ''}`} onClick={() => setActiveFilter('unread')}>Unread</button>
          <button className={`filter-tab ${activeFilter === 'favorites' ? 'active' : ''}`} onClick={() => setActiveFilter('favorites')}>Favorites</button>
          <button className={`filter-tab ${activeFilter === 'groups' ? 'active' : ''}`} onClick={() => setActiveFilter('groups')}>Groups</button>
        </div>

        {/* User / Chat List */}
        <div className="user-list">
          {filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const lastMsg = lastMessages[user._id] || '';
              return (
                <div
                  key={user._id}
                  className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                  onClick={() => onSelectUser(user)}
                >
                  <UserAvatar username={user.username} size="md" />
                  <div className="user-info">
                    <div className="user-item-top">
                      <span className="user-name">{user.username}</span>
                      <span className="user-time">{lastMsg ? formatTime() : ''}</span>
                    </div>
                    <div className="user-item-bottom">
                      <span className="last-message">
                        {lastMsg ? (
                          <>
                            <svg className="tick-icon" viewBox="0 0 16 11" width="14" height="11">
                              <path d="M11.071.653a.8.8 0 0 1 1.206 1.048l-.065.074-6.51 6.588a.8.8 0 0 1-1.071.072l-.076-.072L1.763 5.57a.8.8 0 0 1 1.048-1.204l.074.065 2.24 2.24 5.946-6.018z" fill="#53bdeb"/>
                              <path d="M14.571.653a.8.8 0 0 1 1.206 1.048l-.065.074-6.51 6.588a.8.8 0 0 1-1.071.072l-.076-.072-.684-.693a.8.8 0 0 1 1.048-1.204l.074.065.141.142 5.937-6.02z" fill="#53bdeb"/>
                            </svg>
                            {lastMsg}
                          </>
                        ) : (
                          <span style={{ color: '#aaa', fontStyle: 'italic' }}>Start a conversation</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-users">
              <div className="no-users-icon">💬</div>
              <p>{searchQuery ? 'No contacts found' : 'No contacts yet'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
