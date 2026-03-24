import React, { useState, useRef } from 'react';
import axios from 'axios';
import './StatusUploader.css';

const API = import.meta.env.VITE_API_URL;

const StatusUploader = ({ userId, onStatusPosted, onClose }) => {
  const [text, setText] = useState('');
  const [audioData, setAudioData] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [audioPreview, setAudioPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioFileInputRef = useRef(null);
  const videoFileInputRef = useRef(null);
  const chunksRef = useRef([]);

  // ─── Audio Recording ────────────────────────────────────────────────────
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result.split(',')[1];
          setAudioData(base64);
          setAudioPreview(URL.createObjectURL(blob));
          setMessage('Audio recorded successfully');
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
      setError('');
    } catch (err) {
      setError('Microphone access denied: ' + err.message);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  // ─── Video Recording ────────────────────────────────────────────────────
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target.result.split(',')[1];
          setVideoData(base64);
          setVideoPreview(URL.createObjectURL(blob));
          setMessage('Video recorded successfully');
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingVideo(true);
      setError('');
    } catch (err) {
      setError('Camera access denied: ' + err.message);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
    }
  };

  // ─── File Upload Handlers ──────────────────────────────────────────────
  const handleAudioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Audio file too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      setAudioData(base64);
      setAudioPreview(URL.createObjectURL(file));
      setMessage('Audio file selected: ' + file.name);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('Video file too large (max 50MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1];
      setVideoData(base64);
      setVideoPreview(URL.createObjectURL(file));
      setMessage('Video file selected: ' + file.name);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // ─── Remove Media ──────────────────────────────────────────────────────
  const removeAudio = () => {
    setAudioData(null);
    setAudioPreview(null);
  };

  const removeVideo = () => {
    setVideoData(null);
    setVideoPreview(null);
  };

  // ─── Post Status ──────────────────────────────────────────────────────
  const postStatus = async () => {
    if (!text.trim() && !audioData && !videoData) {
      setError('Please add text, audio, or video to your status');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/api/status`, {
        userId,
        text: text.trim() || null,
        audioData,
        videoData,
      });

      setMessage('Status posted successfully!');
      setError('');
      setText('');
      setAudioData(null);
      setVideoData(null);
      setAudioPreview(null);
      setVideoPreview(null);

      if (onStatusPosted) {
        onStatusPosted(response.data.status);
      }

      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to post status: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="status-uploader">
      <div className="status-uploader-header">
        <h2>Post Status</h2>
        <button className="status-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="status-uploader-content">
        {/* Text Input */}
        <div className="text-input-section">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind? (max 139 characters)"
            maxLength="139"
            className="status-text-input"
          />
          <div className="text-counter">{text.length}/139</div>
        </div>

        {/* Media Controls */}
        <div className="media-controls">
          <h3>Add Media</h3>

          {/* Audio Section */}
          <div className="media-section">
            <h4>🎤 Audio</h4>
            <div className="media-buttons">
              {!isRecordingAudio ? (
                <button onClick={startAudioRecording} className="btn-record">
                  Record Audio
                </button>
              ) : (
                <button onClick={stopAudioRecording} className="btn-stop">
                  Stop Recording
                </button>
              )}
              <button
                onClick={() => audioFileInputRef.current?.click()}
                className="btn-upload"
              >
                Upload Audio
              </button>
            </div>
            <input
              ref={audioFileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileChange}
              style={{ display: 'none' }}
            />
            {audioPreview && (
              <div className="media-preview">
                <audio
                  controls
                  src={audioPreview}
                  style={{ maxWidth: '100%', marginTop: '10px' }}
                />
                <button onClick={removeAudio} className="btn-remove">
                  Remove Audio
                </button>
              </div>
            )}
          </div>

          {/* Video Section */}
          <div className="media-section">
            <h4>🎥 Video</h4>
            <div className="media-buttons">
              {!isRecordingVideo ? (
                <button onClick={startVideoRecording} className="btn-record">
                  Record Video
                </button>
              ) : (
                <button onClick={stopVideoRecording} className="btn-stop">
                  Stop Recording
                </button>
              )}
              <button
                onClick={() => videoFileInputRef.current?.click()}
                className="btn-upload"
              >
                Upload Video
              </button>
            </div>
            <input
              ref={videoFileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              style={{ display: 'none' }}
            />
            {videoPreview && (
              <div className="media-preview">
                <video
                  controls
                  src={videoPreview}
                  style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px' }}
                />
                <button onClick={removeVideo} className="btn-remove">
                  Remove Video
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {/* Post Button */}
        <div className="status-uploader-footer">
          <button
            onClick={postStatus}
            disabled={loading || (!text.trim() && !audioData && !videoData)}
            className="btn-post-status"
          >
            {loading ? 'Posting...' : 'Post Status'}
          </button>
          <button onClick={onClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUploader;
