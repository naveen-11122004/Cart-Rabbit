import React, { useState } from 'react';
import './PollCreator.css';

const PollCreator = ({ onSendPoll, onClose }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSend = () => {
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    const filledOptions = options.filter(opt => opt.trim()).slice(0, 4);
    if (filledOptions.length < 2) {
      alert('Please add at least 2 options');
      return;
    }

    onSendPoll({
      type: 'poll',
      question: question.trim(),
      options: filledOptions,
      votes: filledOptions.reduce((acc, _, i) => {
        acc[i] = 0;
        return acc;
      }, {})
    });
  };

  return (
    <div className="poll-creator-modal">
      <div className="poll-creator-container">
        <div className="creator-header">
          <h3>📊 Create Poll</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="creator-content">
          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              maxLength={120}
              className="question-input"
            />
            <span className="char-count">{question.length}/120</span>
          </div>

          <div className="options-section">
            <label>Options (2-4)</label>
            <div className="options-list">
              {options.map((option, index) => (
                <div key={index} className="option-row">
                  <span className="option-num">{index + 1}</span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    maxLength={50}
                    className="option-input"
                  />
                  {options.length > 2 && (
                    <button
                      className="remove-option-btn"
                      onClick={() => removeOption(index)}
                      title="Remove option"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {options.length < 4 && (
            <button className="add-option-btn" onClick={addOption}>
              + Add Option
            </button>
          )}
        </div>

        <div className="creator-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="send-btn" onClick={handleSend}>Send Poll</button>
        </div>
      </div>
    </div>
  );
};

export default PollCreator;
