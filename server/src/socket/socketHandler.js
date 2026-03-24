const { setIo } = require('../controllers/statusController');

const socketHandler = (io) => {
  // Share the io instance with the status controller so it can emit events
  setIo(io);

  // Store active users: userId -> socketId
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Store current user ID for this socket
    let currentUserId = null;

    // User joins their own room
    socket.on('join', (userId) => {
      socket.join(userId);
      activeUsers.set(userId, socket.id);
      currentUserId = userId;
      console.log(`User ${userId} joined room with socket ${socket.id}`);
    });

    // Handle sending text messages
    socket.on('sendMessage', (messageData) => {
      const { senderId, receiverId, content, timestamp } = messageData;

      io.to(receiverId).emit('receiveMessage', {
        senderId,
        receiverId,
        content,
        timestamp,
      });

      console.log(`Message from ${senderId} to ${receiverId}: ${content}`);
    });

    // ============== STATUS EVENTS ==============

    // Client emits this after a successful POST /api/status — we re-broadcast to all
    // (The controller already calls io.emit('newStatus', ...) directly, so this
    //  event is optional but kept for client-side flexibility.)
    socket.on('postStatus', (data) => {
      io.emit('newStatus', {
        statusId:  data.statusId,
        userId:    data.userId,
        username:  data.username,
        text:      data.text,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
      });
    });

    // Client emits this when a status is viewed — notify the status owner
    socket.on('statusViewed', ({ statusId, viewerId, ownerId }) => {
      if (ownerId) {
        io.to(ownerId).emit('statusViewUpdate', { statusId, viewerId });
      }
    });

    // ============== CALL SIGNALING ==============

    socket.on('initiateCall', ({ callerId, receiverId, callType }) => {
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverId).emit('incomingCall', {
          callerId,
          callType,
          socketId: socket.id,
        });
        console.log(`Call initiated from ${callerId} to ${receiverId} (${callType})`);
      } else {
        socket.emit('callFailed', { message: 'User is offline' });
      }
    });

    socket.on('acceptCall', ({ callerId, receiverId }) => {
      const callerSocketId = activeUsers.get(callerId);
      if (callerSocketId) {
        io.to(callerId).emit('callAccepted', {
          receiverId,
          socketId: socket.id,
        });
        console.log(`Call accepted by ${receiverId} for caller ${callerId}`);
      }
    });

    socket.on('declineCall', ({ callerId, receiverId }) => {
      const callerSocketId = activeUsers.get(callerId);
      if (callerSocketId) {
        io.to(callerId).emit('callDeclined', { receiverId });
        console.log(`Call declined by ${receiverId} for caller ${callerId}`);
      }
    });

    socket.on('sendOffer', ({ receiverId, offer }) => {
      io.to(receiverId).emit('receiveOffer', { offer, senderId: socket.id });
    });

    socket.on('sendAnswer', ({ receiverId, answer }) => {
      io.to(receiverId).emit('receiveAnswer', { answer, senderId: socket.id });
    });

    socket.on('sendIceCandidate', ({ receiverId, candidate }) => {
      io.to(receiverId).emit('receiveIceCandidate', { candidate, senderId: socket.id });
    });

    socket.on('endCall', ({ receiverId }) => {
      io.to(receiverId).emit('callEnded', { senderId: socket.id });
      console.log(`Call ended between ${socket.id} and ${receiverId}`);
    });

    // ============== AUDIO MESSAGE (REAL-TIME) ==============
    socket.on('sendAudio', ({ receiverId, audio, mimeType, timestamp }, callback) => {
      try {
        // Send audio directly to receiver without storing
        io.to(receiverId).emit('receiveAudio', {
          senderId: currentUserId,
          audio,
          mimeType,
          timestamp,
        });

        // Acknowledge to sender
        if (callback && typeof callback === 'function') {
          callback({ success: true });
        }

        console.log(`Audio message sent from ${currentUserId} to ${receiverId}`);
      } catch (error) {
        console.error('Error sending audio:', error);
        if (callback && typeof callback === 'function') {
          callback({ success: false, error: error.message });
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });
};

module.exports = socketHandler;
