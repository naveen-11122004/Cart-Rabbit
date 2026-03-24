import React, { useState, useRef, useEffect } from 'react';
import './AudioRecorder.css';

const AudioRecorder = ({ onSendAudio, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      streamRef.current?.getTracks().forEach(track => track.stop());
      clearInterval(timerRef.current);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSendAudio(audioBlob);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setDuration(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="audio-recorder-modal">
      <div className="audio-recorder-container">
        <div className="recorder-header">
          <h3>Record Audio</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {!audioBlob ? (
          <div className="recorder-content">
            <div className={`recording-indicator ${isRecording ? 'active' : ''}`}>
              {isRecording && <span className="pulse"></span>}
              <span className="timer">{formatTime(duration)}</span>
            </div>
            
            <div className="recorder-controls">
              {!isRecording ? (
                <button className="record-btn" onClick={startRecording}>
                  🎤 Start Recording
                </button>
              ) : (
                <button className="stop-btn" onClick={stopRecording}>
                  ⏹️ Stop Recording
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="playback-content">
            <div className="playback-info">
              <span className="playback-duration">🎵 {formatTime(duration)}</span>
              <p>Audio ready to send</p>
            </div>
            <div className="playback-controls">
              <button className="reset-btn" onClick={handleReset}>
                Re-record
              </button>
              <button className="send-btn" onClick={handleSend}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
