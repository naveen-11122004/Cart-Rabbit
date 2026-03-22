import React, { useEffect, useRef } from 'react';
import './CallModal.css';

const CallModal = ({
  callState,
  callData,
  localStream,
  remoteStream,
  onAccept,
  onDecline,
  onEndCall
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [duration, setDuration] = React.useState(0);

  useEffect(() => {
    let interval;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState]);

  if (!callState) return null;

  const isVideo = callData?.callType === 'video';

  return (
    <div className="call-modal-overlay">
      <div className={`call-modal-container ${callState === 'connected' ? 'connected' : ''}`}>
        
        {/* Header info during ringing */}
        {callState !== 'connected' && (
          <div className="call-info">
            <div className="call-avatar">
              {callData?.username ? callData.username.charAt(0).toUpperCase() : '?'}
            </div>
            <h2 className="call-name">{callData?.username || 'Unknown'}</h2>
            <p className="call-status">
              {callState === 'receiving' ? `Incoming ${isVideo ? 'video' : 'voice'} call...` : 'Calling...'}
            </p>
          </div>
        )}

        {/* Video Streams */}
        {callState === 'connected' && isVideo && (
          <div className="video-container">
            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
            <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
          </div>
        )}

        {/* Audio Only Streams (Hidden visual but active) */}
        {callState === 'connected' && !isVideo && (
          <div className="audio-call-ui">
            <div className="call-avatar pulse">
              {callData?.username ? callData.username.charAt(0).toUpperCase() : '?'}
            </div>
            <h2 className="call-name">{callData?.username || 'Unknown'}</h2>
            <p className="call-status">{formatTime(duration)} (Connected)</p>
            <audio ref={remoteVideoRef} autoPlay playsInline className="remote-audio-hidden" />
          </div>
        )}

        {/* Action Controls */}
        <div className="call-controls">
          {callState === 'receiving' && (
            <button className="call-btn accept-btn" onClick={onAccept}>
              <span className="call-icon">📞</span>
            </button>
          )}

          <button className="call-btn decline-btn" onClick={callState === 'receiving' ? onDecline : onEndCall}>
            <span className="call-icon">☎</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
