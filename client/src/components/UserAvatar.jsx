import React from 'react';
import './UserAvatar.css';

const UserAvatar = ({ username, size = 'md', profilePicture = null }) => {
  const initials = username
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ];

  const colorIndex = username.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  if (profilePicture) {
    return (
      <div className={`avatar avatar-${size} avatar-image`} key={`avatar-${profilePicture.substring(0, 30)}`}>
        <img
          src={profilePicture}
          alt={username}
          title={username}
          className="avatar-img"
        />
      </div>
    );
  }

  return (
    <div className={`avatar avatar-${size}`} style={{ backgroundColor: bgColor }}>
      {initials}
    </div>
  );
};

export default UserAvatar;
