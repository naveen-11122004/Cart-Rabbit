import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ContactPicker.css';

const API = import.meta.env.VITE_API_URL;

const ContactPicker = ({ onSendContact, onClose, currentUserId }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`${API}/api/users`);
      // Filter out current user
      const filtered = res.data.filter(user => user._id !== currentUserId);
      setContacts(filtered);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectContact = (contact) => {
    onSendContact({
      type: 'contact',
      name: contact.username,
      phone: 'Not available',
      email: contact.email,
      userId: contact._id,
      timestamp: new Date().toISOString()
    });
  };

  const getAvatarColor = (username) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    const hash = username.charCodeAt(0);
    return colors[hash % colors.length];
  };

  return (
    <div className="contact-picker-modal">
      <div className="contact-picker-container">
        <div className="picker-header">
          <h3>👤 Select Contact</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="picker-search">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="search-input"
          />
        </div>

        <div className="contacts-list">
          {loading ? (
            <div className="loading">Loading contacts...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="no-results">No contacts found</div>
          ) : (
            filteredContacts.map(contact => (
              <button
                key={contact._id}
                className="contact-item"
                onClick={() => handleSelectContact(contact)}
              >
                <div
                  className="contact-avatar"
                  style={{ backgroundColor: getAvatarColor(contact.username) }}
                >
                  {contact.username[0].toUpperCase()}
                </div>
                <div className="contact-info">
                  <div className="contact-name">{contact.username}</div>
                  <div className="contact-email">{contact.email}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPicker;
