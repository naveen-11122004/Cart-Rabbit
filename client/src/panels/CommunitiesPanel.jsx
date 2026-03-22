import React, { useState, useEffect } from 'react';
import './Panel.css';
import './CommunitiesPanel.css';

const SEED_COMMUNITIES = [
  { id: 'c1', name: 'Tech & Coding 💻', desc: 'Share code, discuss tech trends, and grow together.', members: 1842, icon: '💻' },
  { id: 'c2', name: 'UI/UX Designers 🎨', desc: 'Design tips, inspiration and portfolio feedback.', members: 934, icon: '🎨' },
  { id: 'c3', name: 'Study Group 📚', desc: 'Focus, share notes and ace your exams together.', members: 567, icon: '📚' },
  { id: 'c4', name: 'Gaming Zone 🎮', desc: 'Multiplayer sessions, game recommendations and reviews.', members: 3201, icon: '🎮' },
  { id: 'c5', name: 'Startup Founders 🚀', desc: 'Build, launch and scale — share your journey.', members: 718, icon: '🚀' },
  { id: 'c6', name: 'Fitness & Health 🏋️', desc: 'Workouts, nutrition tips and motivation daily.', members: 2130, icon: '🏋️' },
];

const CommunitiesPanel = () => {
  const [joined, setJoined] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wa_communities') || '[]'); } catch { return []; }
  });
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [custom, setCustom] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wa_custom_communities') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('wa_communities', JSON.stringify(joined));
  }, [joined]);

  useEffect(() => {
    localStorage.setItem('wa_custom_communities', JSON.stringify(custom));
  }, [custom]);

  const toggle = (id) => {
    setJoined(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const createCommunity = () => {
    if (!newName.trim()) return;
    const c = { id: `cc_${Date.now()}`, name: newName.trim(), desc: newDesc.trim(), members: 1, icon: '🌐' };
    setCustom(prev => [c, ...prev]);
    setJoined(prev => [...prev, c.id]);
    setNewName(''); setNewDesc('');
    setShowModal(false);
  };

  const all = [...custom, ...SEED_COMMUNITIES];
  const sorted = [...all].sort((a, b) => {
    return (joined.includes(b.id) ? 1 : 0) - (joined.includes(a.id) ? 1 : 0);
  });

  return (
    <div className="panel communities-panel">
      <div className="panel-header">
        <h2>Communities</h2>
        <button className="panel-icon-btn" onClick={() => setShowModal(true)} title="Create community">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>

      <div className="panel-body">
        {/* Hero banner */}
        <div className="comm-hero">
          <div className="comm-hero-icon">🏘️</div>
          <h3>Stay connected with communities</h3>
          <p>Groups you're part of live here. Join or create communities to connect with people who matter.</p>
          <button className="panel-btn-primary" onClick={() => setShowModal(true)}>
            + Create community
          </button>
        </div>

        <hr className="panel-divider" />

        {joined.length > 0 && (
          <>
            <div className="panel-section-label">Joined Communities</div>
            {sorted.filter(c => joined.includes(c.id)).map(c => (
              <CommunityRow key={c.id} c={c} joined={true} onToggle={() => toggle(c.id)} />
            ))}
            <hr className="panel-divider" />
          </>
        )}

        <div className="panel-section-label">Suggested Communities</div>
        {sorted.filter(c => !joined.includes(c.id)).map(c => (
          <CommunityRow key={c.id} c={c} joined={false} onToggle={() => toggle(c.id)} />
        ))}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="panel-overlay" onClick={() => setShowModal(false)}>
          <div className="comm-modal" onClick={e => e.stopPropagation()}>
            <div className="comm-modal-header">
              <h3>Create Community</h3>
              <button className="panel-overlay-close" style={{position:'static',color:'#54656f',fontSize:'20px'}} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <input
              className="comm-modal-input"
              placeholder="Community name *"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              maxLength={50}
            />
            <textarea
              className="comm-modal-input"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="panel-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="panel-btn-primary" onClick={createCommunity} disabled={!newName.trim()}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CommunityRow = ({ c, joined, onToggle }) => (
  <div className="comm-row">
    <div className="comm-icon">{c.icon}</div>
    <div className="comm-body">
      <span className="comm-name">{c.name}</span>
      <span className="comm-desc">{c.desc}</span>
      <span className="comm-members">👥 {c.members.toLocaleString()} members</span>
    </div>
    <button className={`comm-btn ${joined ? 'joined' : ''}`} onClick={onToggle}>
      {joined ? 'Leave' : 'Join'}
    </button>
  </div>
);

export default CommunitiesPanel;
