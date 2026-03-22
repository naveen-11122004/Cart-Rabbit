import React from 'react';
import './Panel.css';
import './CallsPanel.css';

const statusLabel = {
  completed: { label: 'Completed', color: '#111b21' },
  missed: { label: 'Missed', color: '#d4311f' },
  declined: { label: 'Declined', color: '#d4311f' },
};

const CallsPanel = ({ callLogs = [], users = [], onCall }) => {
  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDuration = (secs) => {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="panel calls-panel">
      <div className="panel-header">
        <h2>Calls</h2>
        <button className="panel-icon-btn" title="New call">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </button>
      </div>

      <div className="panel-body">
        {callLogs.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty-icon">📞</div>
            <p className="panel-empty-title">No call history</p>
            <p className="panel-empty-desc">Your calls will appear here. Start a voice or video call from any chat!</p>
          </div>
        ) : (
          <>
            <div className="panel-section-label">Recent Calls</div>
            {callLogs.map((log, i) => {
              const st = statusLabel[log.status] || statusLabel.completed;
              const isMissed = log.status === 'missed' || log.status === 'declined';
              return (
                <div key={i} className="call-row">
                  <div className="call-avatar">
                    <span>{(log.username || '?')[0].toUpperCase()}</span>
                  </div>
                  <div className="call-body">
                    <div className="call-name" style={{ color: isMissed ? '#d4311f' : '#111b21' }}>
                      {log.username || 'Unknown'}
                    </div>
                    <div className="call-meta">
                      {log.direction === 'incoming' ? (
                        <span className="call-dir incoming">↙</span>
                      ) : (
                        <span className="call-dir outgoing">↗</span>
                      )}
                      {log.callType === 'video' ? ' 📹 Video' : ' 🎙️ Voice'}
                      <span className="call-status-dot" style={{ color: st.color }}> · {st.label}</span>
                      {log.duration > 0 && <span> · {formatDuration(log.duration)}</span>}
                    </div>
                  </div>
                  <div className="call-right">
                    <div className="call-time">{formatTime(log.timestamp)}</div>
                    <button
                      className="call-back-btn"
                      onClick={() => onCall && onCall(log.userId, log.callType)}
                      title={`Call ${log.username}`}
                    >
                      {log.callType === 'video' ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default CallsPanel;
