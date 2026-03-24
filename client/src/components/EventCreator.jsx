import React, { useState } from 'react';
import './EventCreator.css';

const EventCreator = ({ onSendEvent, onClose }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');

  const handleSend = () => {
    if (!title.trim()) {
      alert('Please enter an event title');
      return;
    }
    if (!date) {
      alert('Please select a date');
      return;
    }

    onSendEvent({
      type: 'event',
      title: title.trim(),
      date,
      time,
      description: description.trim(),
      timestamp: new Date().toISOString()
    });
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="event-creator-modal">
      <div className="event-creator-container">
        <div className="creator-header">
          <h3>📅 Create Event</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="creator-content">
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Team Meeting, Birthday Party"
              maxLength={50}
              className="event-input"
            />
            <span className="char-count">{title.length}/50</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="event-input"
              />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="event-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add event details (optional)"
              maxLength={200}
              rows={3}
              className="event-textarea"
            />
            <span className="char-count">{description.length}/200</span>
          </div>
        </div>

        <div className="creator-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="send-btn" onClick={handleSend}>Send Event</button>
        </div>
      </div>
    </div>
  );
};

export default EventCreator;
