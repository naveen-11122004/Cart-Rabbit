import React, { useState } from 'react';
import './ScheduleCallModal.css';

const ScheduleCallModal = ({ isOpen, onClose, onSchedule, currentUser, recipientUser }) => {
  const [title, setTitle] = useState(`${currentUser.username}'s call`);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('20:00');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState('20:30');
  const [showEndTime, setShowEndTime] = useState(true);
  const [callType, setCallType] = useState('video');
  const [showCallTypeDropdown, setShowCallTypeDropdown] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const scheduledStartTime = new Date(`${startDate}T${startTime}`);
    const scheduledEndTime = showEndTime ? new Date(`${endDate}T${endTime}`) : null;

    onSchedule({
      title,
      description,
      startTime: scheduledStartTime.toISOString(),
      endTime: scheduledEndTime ? scheduledEndTime.toISOString() : null,
      callType,
      receiverId: recipientUser._id,
      callerId: currentUser._id
    });
    onClose();
  };

  return (
    <div className="schedule-modal-overlay">
      <div className="schedule-modal-container">
        <div className="schedule-modal-header">
          <button className="close-btn" onClick={onClose}>✕</button>
          <h2>Schedule call</h2>
        </div>

        <form onSubmit={handleSubmit} className="schedule-form">
          <div className="input-group">
            <label>Call name</label>
            <div className="input-with-emoji">
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                maxLength={100}
              />
              <span className="emoji-btn">😀</span>
            </div>
          </div>

          <div className="input-group description-group">
            <textarea 
              placeholder="Description (optional)" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className="emoji-btn textarea-emoji">😀</span>
          </div>

          <div className="schedule-time-section">
            <div className="time-row">
              <div className="label-col">Start date and time</div>
              <div className="date-input">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="time-input">
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
            </div>

            {showEndTime && (
              <div className="time-row">
                <div className="label-col">End date and time</div>
                <div className="date-input">
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="time-input">
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
            )}

            <div className="remove-end-time">
              <button type="button" onClick={() => setShowEndTime(!showEndTime)}>
                {showEndTime ? '✕ Remove end time' : '＋ Add end time'}
              </button>
            </div>
            <p className="notice">Events with call links can't be more than one year in the future</p>
          </div>

          <div className="schedule-call-type">
            <label>Call type</label>
            <div className="call-type-selector">
              <button 
                type="button" 
                className="type-btn"
                onClick={() => setShowCallTypeDropdown(!showCallTypeDropdown)}
              >
                <span>{callType === 'video' ? '📹 Video' : '📞 Voice'}</span>
                <span className="chevron-down">▼</span>
              </button>
              {showCallTypeDropdown && (
                <div className="type-dropdown">
                  <button type="button" onClick={() => { setCallType('video'); setShowCallTypeDropdown(false); }}>📹 Video</button>
                  <button type="button" onClick={() => { setCallType('voice'); setShowCallTypeDropdown(false); }}>📞 Voice</button>
                </div>
              )}
            </div>
          </div>

          <div className="schedule-footer">
            <button type="submit" className="schedule-submit-btn">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
                <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleCallModal;
