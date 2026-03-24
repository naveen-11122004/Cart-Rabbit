import React, { useState } from 'react';
import './StickerPicker.css';

const STICKER_SETS = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '😭', '😗', '😙', '😚', '😘', '🥰', '😍', '😍', '🤩', '😘'],
  gestures: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎', '👊', '👏'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊'],
  food: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦']
};

const StickerPicker = ({ onSendSticker, onClose }) => {
  const [activeSet, setActiveSet] = useState('smileys');

  const handleSendSticker = (sticker) => {
    onSendSticker({
      type: 'sticker',
      content: sticker,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="sticker-picker-modal">
      <div className="sticker-picker-container">
        <div className="picker-header">
          <h3>✨ Stickers</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="sticker-tabs">
          {Object.keys(STICKER_SETS).map(setName => (
            <button
              key={setName}
              className={`sticker-tab ${activeSet === setName ? 'active' : ''}`}
              onClick={() => setActiveSet(setName)}
              title={setName}
            >
              {setName === 'smileys' && '😀'}
              {setName === 'gestures' && '👋'}
              {setName === 'animals' && '🐶'}
              {setName === 'food' && '🍎'}
            </button>
          ))}
        </div>

        <div className="stickers-grid">
          {STICKER_SETS[activeSet]?.map((sticker, index) => (
            <button
              key={index}
              className="sticker-item"
              onClick={() => handleSendSticker(sticker)}
              title={sticker}
            >
              {sticker}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StickerPicker;
