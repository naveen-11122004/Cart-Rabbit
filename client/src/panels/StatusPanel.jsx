import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import UserAvatar from '../components/UserAvatar';
import { getSocket } from '../utils/socket';
import './Panel.css';
import './StatusPanel.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MAX_CHARS = 139;

// ─── Helpers ────────────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60)  return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  return Math.floor(seconds / 86400) + 'd ago';
};

// ─── StatusPanel ────────────────────────────────────────────────────────────

const StatusPanel = ({ currentUser }) => {
  // currentUser = { userId, username, email }

  const [myStatuses, setMyStatuses]       = useState([]);
  const [othersStatuses, setOthersStatuses] = useState([]);
  const [composing, setComposing]         = useState(false);
  const [statusText, setStatusText]       = useState('');
  const [posting, setPosting]             = useState(false);
  const [viewingStatus, setViewingStatus] = useState(null);
  // { user: { _id, username }, statuses: [], currentIndex: 0, isOwn: bool }
  const [viewCounts, setViewCounts]       = useState({}); // statusId -> count
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  const textareaRef = useRef(null);

  // ── Fetch on mount ──────────────────────────────────────────────────────

  const fetchStatuses = useCallback(async () => {
    if (!currentUser?.userId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/api/status/${currentUser.userId}?currentUserId=${currentUser.userId}`
      );
      setMyStatuses(res.data.myStatuses || []);
      setOthersStatuses(res.data.othersStatuses || []);
    } catch (err) {
      console.error('Failed to fetch statuses', err);
      setError('Could not load statuses');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.userId]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // ── Socket real-time updates ────────────────────────────────────────────

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !currentUser?.userId) return;

    const handleNewStatus = (data) => {
      if (data.userId === currentUser.userId) {
        // My own new status (broadcasted back to me)
        setMyStatuses(prev => {
          // Avoid duplicates
          if (prev.some(s => s._id === data.statusId || s.statusId === data.statusId)) return prev;
          return [{ _id: data.statusId, text: data.text, createdAt: data.createdAt, expiresAt: data.expiresAt, viewers: [] }, ...prev];
        });
      } else {
        setOthersStatuses(prev => {
          const existing = prev.find(g => g.user._id === data.userId || g.user._id.toString() === data.userId);
          if (existing) {
            return prev.map(g =>
              (g.user._id === data.userId || g.user._id.toString() === data.userId)
                ? {
                    ...g,
                    statuses: [
                      { _id: data.statusId, text: data.text, createdAt: data.createdAt, expiresAt: data.expiresAt, viewers: [] },
                      ...g.statuses,
                    ],
                  }
                : g
            );
          }
          return [
            {
              user: { _id: data.userId, username: data.username },
              statuses: [{ _id: data.statusId, text: data.text, createdAt: data.createdAt, expiresAt: data.expiresAt, viewers: [] }],
            },
            ...prev,
          ];
        });
      }
    };

    const handleStatusViewUpdate = ({ statusId, viewCount }) => {
      setViewCounts(prev => ({ ...prev, [statusId]: viewCount }));
      setMyStatuses(prev =>
        prev.map(s => s._id === statusId ? { ...s, viewers: Array(viewCount).fill('x') } : s)
      );
    };

    const handleStatusDeleted = ({ statusId, userId }) => {
      if (userId === currentUser.userId) {
        setMyStatuses(prev => prev.filter(s => s._id !== statusId));
      } else {
        setOthersStatuses(prev =>
          prev
            .map(g => ({ ...g, statuses: g.statuses.filter(s => s._id !== statusId) }))
            .filter(g => g.statuses.length > 0)
        );
      }
    };

    socket.on('newStatus', handleNewStatus);
    socket.on('statusViewUpdate', handleStatusViewUpdate);
    socket.on('statusDeleted', handleStatusDeleted);

    return () => {
      socket.off('newStatus', handleNewStatus);
      socket.off('statusViewUpdate', handleStatusViewUpdate);
      socket.off('statusDeleted', handleStatusDeleted);
    };
  }, [currentUser?.userId]);

  // ── Post status ─────────────────────────────────────────────────────────

  const handlePost = async () => {
    if (!statusText.trim() || posting) return;
    try {
      setPosting(true);
      await axios.post(`${API}/api/status`, {
        userId: currentUser.userId,
        text: statusText.trim(),
      });
      setStatusText('');
      setComposing(false);
    } catch (err) {
      console.error('Failed to post status', err);
      setError('Failed to post status');
    } finally {
      setPosting(false);
    }
  };

  // ── Delete status ───────────────────────────────────────────────────────

  const handleDelete = async (statusId) => {
    try {
      await axios.delete(`${API}/api/status/${statusId}`, {
        data: { userId: currentUser.userId },
      });
    } catch (err) {
      console.error('Failed to delete status', err);
      setError('Failed to delete status');
    }
  };

  // ── Open viewer ─────────────────────────────────────────────────────────

  const openViewer = async (user, statuses, currentIndex = 0, isOwn = false) => {
    setViewingStatus({ user, statuses, currentIndex, isOwn });

    // Mark the current status as viewed
    const status = statuses[currentIndex];
    if (status && !isOwn) {
      try {
        await axios.put(`${API}/api/status/${status._id}/view`, {
          currentUserId: currentUser.userId,
        });
        // Update viewers locally
        setOthersStatuses(prev =>
          prev.map(g =>
            g.user._id === user._id
              ? {
                  ...g,
                  statuses: g.statuses.map(s =>
                    s._id === status._id && !s.viewers?.includes(currentUser.userId)
                      ? { ...s, viewers: [...(s.viewers || []), currentUser.userId] }
                      : s
                  ),
                }
              : g
          )
        );
      } catch (_) {}
    }
  };

  const navigateViewer = async (direction) => {
    if (!viewingStatus) return;
    const nextIndex = viewingStatus.currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= viewingStatus.statuses.length) return;

    const nextStatus = viewingStatus.statuses[nextIndex];
    setViewingStatus(prev => ({ ...prev, currentIndex: nextIndex }));

    if (!viewingStatus.isOwn && nextStatus) {
      try {
        await axios.put(`${API}/api/status/${nextStatus._id}/view`, {
          currentUserId: currentUser.userId,
        });
      } catch (_) {}
    }
  };

  const closeViewer = () => setViewingStatus(null);

  // ── Derived ─────────────────────────────────────────────────────────────

  const hasMyStatus = myStatuses.length > 0;
  const currentViewerStatus = viewingStatus?.statuses[viewingStatus.currentIndex];
  const isOwnViewer = viewingStatus?.isOwn;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="panel status-panel">
      <div className="panel-header">
        <h2>Status</h2>
        <button
          className="panel-icon-btn"
          title="New status"
          onClick={() => { setComposing(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
          </svg>
        </button>
      </div>

      <div className="panel-body">

        {/* Error toast */}
        {error && (
          <div className="status-error-bar">
            {error}
            <button onClick={() => setError('')}>✕</button>
          </div>
        )}

        {/* ── My Status ── */}
        <div className="panel-section-label">My Status</div>

        <div
          className="status-my-row"
          onClick={() => hasMyStatus
            ? openViewer({ _id: currentUser.userId, username: currentUser.username }, myStatuses, 0, true)
            : setComposing(true)
          }
        >
          <div className={`status-avatar-wrap ${hasMyStatus ? 'has-status' : ''}`}>
            <UserAvatar username={currentUser?.username || '?'} size="md" />
            {!hasMyStatus && (
              <div className="status-add-dot">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="#fff">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </div>
            )}
          </div>
          <div className="status-row-body">
            <span className="status-row-name">My status</span>
            <span className="status-row-sub">
              {hasMyStatus
                ? `${myStatuses.length} update${myStatuses.length > 1 ? 's' : ''} · ${timeAgo(myStatuses[0].createdAt)}`
                : 'Tap to add status update'}
            </span>
          </div>
          <button
            className="status-compose-btn"
            onClick={e => { e.stopPropagation(); setComposing(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
            title="Add status"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>

        {/* ── Compose box ── */}
        {composing && (
          <div className="status-compose-box">
            <textarea
              ref={textareaRef}
              className="status-compose-input"
              placeholder="Type a status… (max 139 chars)"
              value={statusText}
              onChange={e => setStatusText(e.target.value.slice(0, MAX_CHARS))}
              rows={3}
            />
            <div className="status-compose-footer">
              <span className={`status-char-count ${statusText.length >= MAX_CHARS ? 'limit' : ''}`}>
                {MAX_CHARS - statusText.length}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="panel-btn-ghost"
                  onClick={() => { setComposing(false); setStatusText(''); }}
                >
                  Cancel
                </button>
                <button
                  className="panel-btn-primary"
                  onClick={handlePost}
                  disabled={!statusText.trim() || posting}
                >
                  {posting ? 'Posting…' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        )}

        <hr className="panel-divider" />

        {/* ── Recent Updates ── */}
        <div className="panel-section-label">Recent Updates</div>

        {loading ? (
          <div className="status-empty-state">
            <div className="status-spinner" />
            <p>Loading statuses…</p>
          </div>
        ) : othersStatuses.length === 0 ? (
          <div className="status-empty-state">
            <div className="status-empty-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ccc" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
            </div>
            <p>No recent updates</p>
            <span>Status updates from other users will appear here</span>
          </div>
        ) : (
          othersStatuses.map((group) => {
            const latestStatus = group.statuses[0];
            const hasUnviewed = group.statuses.some(
              s => !s.viewers?.includes(currentUser.userId)
            );
            return (
              <div
                key={group.user._id}
                className="status-row"
                onClick={() => openViewer(group.user, group.statuses, 0, false)}
              >
                <div className={`status-avatar-wrap ${hasUnviewed ? 'has-status' : 'has-status viewed'}`}>
                  <UserAvatar username={group.user.username} size="md" />
                </div>
                <div className="status-row-body">
                  <span className="status-row-name">{group.user.username}</span>
                  <span className="status-row-sub">
                    {latestStatus?.text?.length > 40
                      ? latestStatus.text.slice(0, 40) + '…'
                      : latestStatus?.text}
                    {latestStatus && (
                      <span className="status-row-time"> · {timeAgo(latestStatus.createdAt)}</span>
                    )}
                  </span>
                </div>
                {group.statuses.length > 1 && (
                  <span className="status-count-badge">{group.statuses.length}</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Full-screen Viewer Overlay ── */}
      {viewingStatus && (
        <div className="panel-overlay" onClick={closeViewer}>
          <div className="status-viewer" onClick={e => e.stopPropagation()}>

            {/* Progress bars */}
            <div className="status-viewer-bars">
              {viewingStatus.statuses.map((_, i) => (
                <div
                  key={i}
                  className={`status-bar ${
                    i === viewingStatus.currentIndex ? 'active' : i < viewingStatus.currentIndex ? 'done' : ''
                  }`}
                />
              ))}
            </div>

            {/* Header */}
            <div className="status-viewer-header">
              <UserAvatar username={viewingStatus.user.username} size="md" />
              <div className="status-viewer-meta">
                <div className="status-viewer-name">{viewingStatus.user.username}</div>
                <div className="status-viewer-time">
                  {currentViewerStatus && timeAgo(currentViewerStatus.createdAt)}
                </div>
              </div>
              <button className="status-viewer-close" onClick={closeViewer}>✕</button>
            </div>

            {/* Status text */}
            <div className="status-viewer-text">
              {currentViewerStatus?.text}
            </div>

            {/* Footer: view count or viewer list */}
            <div className="status-viewer-footer">
              {isOwnViewer ? (
                <>
                  <span className="status-view-icon">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  </span>
                  <span>{currentViewerStatus?.viewers?.length ?? 0} view{currentViewerStatus?.viewers?.length !== 1 ? 's' : ''}</span>
                  <button
                    className="status-delete-btn"
                    onClick={() => { handleDelete(currentViewerStatus._id); closeViewer(); }}
                    title="Delete this status"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12 1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </>
              ) : (
                <span className="status-view-count">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="rgba(255,255,255,0.7)">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                  {' '}{currentViewerStatus?.viewers?.length ?? 0}
                </span>
              )}
            </div>

            {/* Navigation arrows */}
            {viewingStatus.currentIndex > 0 && (
              <button className="status-nav-btn left" onClick={() => navigateViewer(-1)}>‹</button>
            )}
            {viewingStatus.currentIndex < viewingStatus.statuses.length - 1 && (
              <button className="status-nav-btn right" onClick={() => navigateViewer(1)}>›</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPanel;
