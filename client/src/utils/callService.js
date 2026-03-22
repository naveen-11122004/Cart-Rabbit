import io from 'socket.io-client';

let socket = null;

// Initialize socket connection
export const initializeSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL, {
      reconnection: true,
    });
  }
  return socket;
};

// Get socket instance
export const getSocket = () => {
  return socket || initializeSocket();
};

// Call signaling functions
export const initiateCall = (callerId, receiverId, callType) => {
  const socket = getSocket();
  socket.emit('initiateCall', { callerId, receiverId, callType });
};

export const acceptCall = (callerId, receiverId) => {
  const socket = getSocket();
  socket.emit('acceptCall', { callerId, receiverId });
};

export const declineCall = (callerId, receiverId) => {
  const socket = getSocket();
  socket.emit('declineCall', { callerId, receiverId });
};

export const endCall = (receiverId) => {
  const socket = getSocket();
  socket.emit('endCall', { receiverId });
};

// WebRTC signaling
export const sendOffer = (receiverId, offer) => {
  const socket = getSocket();
  socket.emit('sendOffer', { receiverId, offer });
};

export const sendAnswer = (receiverId, answer) => {
  const socket = getSocket();
  socket.emit('sendAnswer', { receiverId, answer });
};

export const sendIceCandidate = (receiverId, candidate) => {
  const socket = getSocket();
  socket.emit('sendIceCandidate', { receiverId, candidate });
};

// Listen for incoming calls
export const onIncomingCall = (callback) => {
  const socket = getSocket();
  socket.on('incomingCall', callback);
};

// Listen for call acceptance
export const onCallAccepted = (callback) => {
  const socket = getSocket();
  socket.on('callAccepted', callback);
};

// Listen for call decline
export const onCallDeclined = (callback) => {
  const socket = getSocket();
  socket.on('callDeclined', callback);
};

// Listen for call end
export const onCallEnded = (callback) => {
  const socket = getSocket();
  socket.on('callEnded', callback);
};

// Listen for offers
export const onReceiveOffer = (callback) => {
  const socket = getSocket();
  socket.on('receiveOffer', callback);
};

// Listen for answers
export const onReceiveAnswer = (callback) => {
  const socket = getSocket();
  socket.on('receiveAnswer', callback);
};

// Listen for ICE candidates
export const onReceiveIceCandidate = (callback) => {
  const socket = getSocket();
  socket.on('receiveIceCandidate', callback);
};

// Listen for call failure
export const onCallFailed = (callback) => {
  const socket = getSocket();
  socket.on('callFailed', callback);
};
