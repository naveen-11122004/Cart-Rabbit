import React, { useState, useEffect, useRef } from 'react';
import UserAvatar from '../components/UserAvatar';
import './Panel.css';
import './ChatsPanel.css';

const ChatsPanel = ({ users, selectedUser, onSelectUser, lastMessages, unreadCounts = {} }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [pinned, setPinned] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wa_pinned') || '[]'); } catch { return []; }
  });

  // Persist pinned
  useEffect(() => {
    localStorage.setItem('wa_pinned', JSON.stringify(pinned));
  }, [pinned]);

  const togglePin = (e, userId) => {
    e.stopPropagation();
    setPinned(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const formatTime = (userId) => {
    if (!lastMessages[userId]) return '';
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const sorted = [...users].sort((a, b) => {
    const ap = pinned.includes(a._id) ? 1 : 0;
    const bp = pinned.includes(b._id) ? 1 : 0;
    return bp - ap;
  });

  const filtered = sorted.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'unread') return (unreadCounts[u._id] || 0) > 0;
    if (filter === 'favorites') return pinned.includes(u._id);
    return true; // 'all' and 'groups'
  });

  return (
    <div className="panel chats-panel">
      {/* Header */}
      <div className="panel-header">
        <h2>Chats</h2>
        <button className="panel-icon-btn" title="New chat">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"/>
          </svg>
        </button>
        <button className="panel-icon-btn" title="Menu">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="chats-search">
        <div className="chats-search-wrap">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#8696a0">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search or start new chat"
            className="chats-search-input"
          />
          {search && (
            <button className="chats-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="chats-filters">
        {['all','unread','favorites','groups'].map(f => (
          <button
            key={f}
            className={`chats-filter-pill ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'unread' ? `Unread${Object.values(unreadCounts).reduce((a,b)=>a+b,0) > 0 ? ` ${Object.values(unreadCounts).reduce((a,b)=>a+b,0)}` : ''}` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Contact list */}
      <div className="chats-list">
        {filtered.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty-icon">💬</div>
            <p className="panel-empty-title">{search ? 'No results found' : 'No contacts yet'}</p>
            <p className="panel-empty-desc">Start a new conversation</p>
          </div>
        ) : (
          filtered.map(u => {
            const lastMsg = lastMessages[u._id] || '';
            const unread = unreadCounts[u._id] || 0;
            const isPinned = pinned.includes(u._id);
            return (
              <div
                key={u._id}
                className={`chats-item ${selectedUser?._id === u._id ? 'active' : ''}`}
                onClick={() => onSelectUser(u)}
              >
                <UserAvatar username={u.username} size="md" />
                <div className="chats-item-body">
                  <div className="chats-item-top">
                    <span className="chats-item-name">
                      {isPinned && <span className="chats-pin">📌 </span>}
                      {u.username}
                    </span>
                    <span className={`chats-item-time ${unread > 0 ? 'unread' : ''}`}>
                      {formatTime(u._id)}
                    </span>
                  </div>
                  <div className="chats-item-bottom">
                    <span className="chats-item-msg">
                      {lastMsg ? (
                        <>
                          <svg viewBox="0 0 16 11" width="14" height="11" style={{flexShrink:0}}>
                            <path d="M11.071.653a.8.8 0 0 1 1.206 1.048l-.065.074-6.51 6.588a.8.8 0 0 1-1.071.072l-.076-.072L1.763 5.57a.8.8 0 0 1 1.048-1.204l.074.065 2.24 2.24 5.946-6.018z" fill="#53bdeb"/>
                            <path d="M14.571.653a.8.8 0 0 1 1.206 1.048l-.065.074-6.51 6.588a.8.8 0 0 1-1.071.072l-.076-.072-.684-.693a.8.8 0 0 1 1.048-1.204l.074.065.141.142 5.937-6.02z" fill="#53bdeb"/>
                          </svg>
                          {lastMsg}
                        </>
                      ) : (
                        <span className="chats-item-empty">Tap to chat</span>
                      )}
                    </span>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      {unread > 0 && <span className="chats-badge">{unread}</span>}
                      <button
                        className="chats-pin-btn"
                        onClick={e => togglePin(e, u._id)}
                        title={isPinned ? 'Unpin' : 'Pin'}
                      >
                        {isPinned ? '📌' : '📍'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatsPanel;
