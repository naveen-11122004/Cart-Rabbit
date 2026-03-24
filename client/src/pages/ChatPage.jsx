import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { connectSocket, getSocket, disconnectSocket } from '../utils/socket';
import { sendFileMessage } from '../utils/fileUpload';
import NavRail from '../components/NavRail';
import ChatWindow from '../components/ChatWindow';
import CallModal from '../components/CallModal';
import Toast from '../components/Toast';

// Panels
import ChatsPanel from '../panels/ChatsPanel';
import StatusPanel from '../panels/StatusPanel';
import CommunitiesPanel from '../panels/CommunitiesPanel';
import CallsPanel from '../panels/CallsPanel';
import SettingsPanel from '../panels/SettingsPanel';
import ProfilePanel from '../panels/ProfilePanel';

import './ChatPage.css';

const API = import.meta.env.VITE_API_URL;

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const ChatPage = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Nav
  const [activeTab, setActiveTab] = useState('chats');

  // Data
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState('');

  // Toast notifications
  const [toastNotifications, setToastNotifications] = useState([]);

  // Message Actions state
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [forwardMessageData, setForwardMessageData] = useState(null);
  const [deleteMessageData, setDeleteMessageData] = useState(null);

  // Call state
  const [callState, setCallState] = useState(null);
  const [callData, setCallData] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callLogs, setCallLogs] = useState([]);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callDataRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);

  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);
  useEffect(() => { callDataRef.current = callData; }, [callData]);

  useEffect(() => {
    if (!isAuthenticated || !user) navigate('/login');
  }, [isAuthenticated, user, navigate]);

  // Fetch all users
  useEffect(() => {
    if (!user?.userId) return;
    axios
      .get(`${API}/api/users?currentUserId=${user.userId}`)
      .then(res => setUsers(res.data.users))
      .catch(() => setError('Failed to fetch users'));
  }, [user?.userId]);

  // Ask for notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Socket connection
  useEffect(() => {
    if (!user?.userId) return;
    const socket = connectSocket(user.userId);

    socket.on('receiveMessage', messageData => {
      if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
        new Notification('New Message', {
          body: messageData.file ? 'Attached a file' : messageData.content,
        });
      }

      const incoming = {
        _id: messageData._id || Date.now(),
        senderId: { _id: messageData.senderId },
        receiverId: { _id: messageData.receiverId },
        content: messageData.content,
        messageType: messageData.messageType || 'text',
        file: messageData.file || null,
        createdAt: messageData.timestamp,
      };
      setMessages(prev => [...prev, incoming]);
      
      // Get sender username from users list
      const senderUser = users.find(u => u._id === messageData.senderId);
      const senderName = senderUser?.username || 'New message';
      
      // Show toast notification
      const toastId = Date.now();
      setToastNotifications(prev => [...prev, {
        id: toastId,
        message: messageData.file ? `📎 ${messageData.file.filename || 'File'}` : messageData.content,
        sender: senderName
      }]);

      const peerId = messageData.senderId === user.userId ? messageData.receiverId : messageData.senderId;
      setLastMessages(prev => ({
        ...prev,
        [peerId]: messageData.file ? `📎 ${messageData.file.filename || 'File'}` : messageData.content,
      }));
      // Increment unread if not this chat
      setUnreadCounts(prev => {
        if (peerId === messageData.senderId) {
          return { ...prev, [peerId]: (prev[peerId] || 0) + 1 };
        }
        return prev;
      });
    });

    socket.on('incomingCall', async ({ callerId, callType }) => {
      try {
        const res = await axios.get(`${API}/api/users?currentUserId=${user.userId}`);
        const caller = res.data.users.find(u => u._id === callerId);
        const callerName = caller?.username || 'Unknown';
        setCallData({ callerId, receiverId: user.userId, callType, username: callerName });
        setCallState('receiving');

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Incoming Call', {
            body: `${callerName} is calling you via ${callType}...`,
          });
        }
      } catch {}
    });

    socket.on('callAccepted', async () => {
      setCallState('connected');
      callStartTimeRef.current = Date.now();
      const pc = createPeerConnection(socket);
      peerConnectionRef.current = pc;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current));
      }
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('sendOffer', { receiverId: callDataRef.current.receiverId, offer });
    });

    socket.on('receiveOffer', async ({ offer }) => {
      const pc = peerConnectionRef.current || createPeerConnection(socket);
      if (!peerConnectionRef.current) peerConnectionRef.current = pc;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Add queued ICE candidates
      while (iceCandidateQueueRef.current.length) {
        const candidate = iceCandidateQueueRef.current.shift();
        try { await pc.addIceCandidate(candidate); } catch (e) { console.warn(e); }
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current));
      }
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('sendAnswer', { receiverId: callDataRef.current.callerId, answer });
    });

    socket.on('receiveAnswer', async ({ answer }) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.signalingState !== 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        // Add queued ICE candidates
        while (iceCandidateQueueRef.current.length) {
          const candidate = iceCandidateQueueRef.current.shift();
          try { await pc.addIceCandidate(candidate); } catch (e) { console.warn(e); }
        }
      }
    });

    socket.on('receiveIceCandidate', async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      const rtcCandidate = new RTCIceCandidate(candidate);
      if (pc && pc.remoteDescription) {
        try { await pc.addIceCandidate(rtcCandidate); } catch (e) { console.warn(e); }
      } else {
        iceCandidateQueueRef.current.push(rtcCandidate);
      }
    });

    socket.on('callEnded', () => {
      addCallLog('completed');
      cleanupCall();
    });

    socket.on('callDeclined', () => {
      addCallLog('declined');
      cleanupCall();
      setError('Call was declined');
    });

    socket.on('callFailed', ({ message }) => {
      addCallLog('declined');
      cleanupCall();
      setError(message || 'User is offline or unavailable');
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('incomingCall');
      socket.off('callAccepted');
      socket.off('receiveOffer');
      socket.off('receiveAnswer');
      socket.off('receiveIceCandidate');
      socket.off('callEnded');
      socket.off('callDeclined');
      socket.off('callFailed');
    };
  }, [user?.userId]);

  const createPeerConnection = socket => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.onicecandidate = event => {
      if (event.candidate && callDataRef.current) {
        const peerId = callDataRef.current.callerId === user.userId
          ? callDataRef.current.receiverId
          : callDataRef.current.callerId;
        socket.emit('sendIceCandidate', { receiverId: peerId, candidate: event.candidate });
      }
    };
    pc.ontrack = event => setRemoteStream(event.streams[0]);
    return pc;
  };

  const addCallLog = (status) => {
    const data = callDataRef.current;
    if (!data) return;
    const duration = callStartTimeRef.current
      ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
      : 0;
    const log = {
      userId: data.callerId === user.userId ? data.receiverId : data.callerId,
      username: data.username,
      callType: data.callType,
      direction: data.callerId === user.userId ? 'outgoing' : 'incoming',
      status,
      duration,
      timestamp: Date.now(),
    };
    setCallLogs(prev => [log, ...prev]);
    callStartTimeRef.current = null;
  };

  const handleStartCall = async (type, targetUserId) => {
    const target = targetUserId
      ? users.find(u => u._id === targetUserId)
      : selectedUser;
    if (!target) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
      setLocalStream(stream);
      const newCallData = { callerId: user.userId, receiverId: target._id, callType: type, username: target.username };
      setCallData(newCallData);
      setCallState('calling');
      const socket = getSocket();
      socket.emit('initiateCall', newCallData);
    } catch {
      setError('Please allow camera and microphone permissions.');
    }
  };

  const handleAcceptCall = async () => {
    try {
      const data = callDataRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: data.callType === 'video' });
      setLocalStream(stream);
      setCallState('connected');
      callStartTimeRef.current = Date.now();
      const socket = getSocket();
      const pc = createPeerConnection(socket);
      peerConnectionRef.current = pc;
      socket.emit('acceptCall', { callerId: data.callerId, receiverId: user.userId });
    } catch {
      setError('Please allow permissions to accept call.');
      handleEndCall();
    }
  };

  const handleDeclineCall = () => {
    const socket = getSocket();
    if (callDataRef.current) {
      socket.emit('declineCall', { callerId: callDataRef.current.callerId, receiverId: user.userId });
    }
    addCallLog('declined');
    cleanupCall();
  };

  const handleEndCall = () => {
    const socket = getSocket();
    if (callDataRef.current && socket) {
      const peerId = callDataRef.current.callerId === user.userId
        ? callDataRef.current.receiverId
        : callDataRef.current.callerId;
      socket.emit('endCall', { receiverId: peerId });
    }
    addCallLog('completed');
    cleanupCall();
  };

  const cleanupCall = () => {
    setCallState(null);
    setCallData(null);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    iceCandidateQueueRef.current = [];
  };

  // Fetch messages
  useEffect(() => {
    if (!selectedUser || !user?.userId) return;
    setLoading(true);
    // Clear unread when opening chat
    setUnreadCounts(prev => ({ ...prev, [selectedUser._id]: 0 }));
    axios
      .get(`${API}/api/messages/${user.userId}/${selectedUser._id}`)
      .then(res => setMessages(res.data.messages))
      .catch(() => setError('Failed to fetch messages'))
      .finally(() => setLoading(false));
  }, [selectedUser, user?.userId]);

  const handleSendMessage = async (content, file = null) => {
    if (!selectedUser || !user?.userId) return;
    
    // Handle Edit Mode
    if (editingMessage) {
      if (!content || content === editingMessage.content) {
        setEditingMessage(null);
        return;
      }
      try {
        await axios.put(`${API}/api/messages/edit/${editingMessage._id}`, { content });
        setMessages(prev => prev.map(m => m._id === editingMessage._id ? { ...m, content, isEdited: true } : m));
        setEditingMessage(null);
      } catch {
        setError('Failed to edit message');
      }
      return;
    }

    try {
      const payload = {
        senderId: user.userId,
        receiverId: selectedUser._id,
        content,
      };

      if (replyingToMessage) {
        const quote = replyingToMessage.content 
          ? `> ${replyingToMessage.content}\n\n` 
          : '> [Attachment]\n\n';
        payload.content = quote + content;
      }

      const res = await axios.post(`${API}/api/messages/send`, payload);
      const saved = res.data.data;
      setMessages(prev => [...prev, saved]);
      setLastMessages(prev => ({ ...prev, [selectedUser._id]: saved.content }));
      
      const socket = getSocket();
      socket?.emit('sendMessage', {
        ...payload, timestamp: new Date(), _id: saved._id
      });
      setReplyingToMessage(null);
    } catch {
      setError('Failed to send message');
    }
  };

  const handleSendFile = async file => {
    if (!selectedUser || !user?.userId) return;
    setFileLoading(true);
    try {
      const saved = await sendFileMessage(user.userId, selectedUser._id, file);
      setMessages(prev => [...prev, saved]);
      setLastMessages(prev => ({ ...prev, [selectedUser._id]: `📎 ${saved.file?.filename || 'File'}` }));
      const socket = getSocket();
      socket?.emit('sendMessage', {
        senderId: user.userId, receiverId: selectedUser._id,
        content: saved.content, file: { filename: saved.file?.filename, mimetype: saved.file?.mimetype },
        timestamp: new Date(),
      });
      setReplyingToMessage(null);
    } catch {
      setError('File upload failed.');
    } finally {
      setFileLoading(false);
    }
  };

  const handleEditMessage = (message) => setEditingMessage(message);
  const handleDeleteMessage = (messageId) => setDeleteMessageData(messageId);
  const handleReplyMessage = (message) => setReplyingToMessage(message);
  const handleForwardMessage = (message) => setForwardMessageData(message);

  const confirmDeleteMessage = async () => {
    if (!deleteMessageData) return;
    try {
      await axios.delete(`${API}/api/messages/delete/${deleteMessageData}`);
      setMessages(prev => prev.map(m => m._id === deleteMessageData ? { ...m, content: 'This message was deleted', isDeleted: true, file: null } : m));
      setDeleteMessageData(null);
    } catch {
      setError('Failed to delete message');
    }
  };

  const confirmForwardMessage = async (targetUser) => {
    if (!targetUser || !forwardMessageData) return;
    try {
      const payload = { senderId: user.userId, receiverId: targetUser._id, content: forwardMessageData.content };
      const res = await axios.post(`${API}/api/messages/send`, payload);
      const socket = getSocket();
      socket?.emit('sendMessage', { ...payload, timestamp: new Date(), _id: res.data.data._id });
      setForwardMessageData(null);
      
      // Select the forwarded user implicitly if desired:
      // handleSelectUser(targetUser);
    } catch {
      setError('Failed to forward message');
    }
  };

  const handleStarMessage = async (messageId) => {
    try {
      await axios.put(`${API}/api/messages/star/${messageId}`, { userId: user.userId });
      setMessages(prev => prev.map(m => {
        if (m._id === messageId) {
          const starredBy = m.starredBy || [];
          const isStarred = starredBy.includes(user.userId);
          return {
            ...m,
            starredBy: isStarred ? starredBy.filter(id => id !== user.userId) : [...starredBy, user.userId]
          };
        }
        return m;
      }));
    } catch {
      setError('Failed to star message');
    }
  };

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setUnreadCounts(prev => ({ ...prev, [u._id]: 0 }));
    if (activeTab !== 'chats') setActiveTab('chats');
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'chats':
        return (
          <ChatsPanel
            users={users}
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            lastMessages={lastMessages}
            unreadCounts={unreadCounts}
          />
        );
      case 'status':
        return (
          <StatusPanel
            currentUser={{
              userId:   user?.userId,
              username: user?.username,
              email:    user?.email,
            }}
          />
        );
      case 'communities':
        return <CommunitiesPanel />;
      case 'calls':
        return (
          <CallsPanel
            callLogs={callLogs}
            users={users}
            onCall={(userId, type) => handleStartCall(type, userId)}
          />
        );
      case 'settings':
        return <SettingsPanel user={user} />;
      case 'profile':
        return <ProfilePanel user={user} />;
      default:
        return null;
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="chat-page">
      {/* Left icon nav rail */}
      <NavRail
        active={activeTab}
        onChange={setActiveTab}
        currentUsername={user.username}
        onLogout={handleLogout}
      />

      {/* Active side panel */}
      {renderPanel()}

      {/* Main chat area */}
      <div className="chat-main">
        <ChatWindow
          messages={messages}
          selectedUser={selectedUser}
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          isLoading={loading || fileLoading}
          currentUser={user}
          onStartCall={handleStartCall}
          onReply={handleReplyMessage}
          onStar={handleStarMessage}
          onForward={handleForwardMessage}
          onEdit={handleEditMessage}
          onDelete={handleDeleteMessage}
          replyingToMessage={replyingToMessage}
          onCancelReply={() => setReplyingToMessage(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </div>

      {/* Delete Modal */}
      {deleteMessageData && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <h3>Delete message?</h3>
            <p>Delete this message for everyone or just yourself?</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setDeleteMessageData(null)}>Cancel</button>
              <button className="modal-btn delete" onClick={confirmDeleteMessage}>Delete for me</button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {forwardMessageData && (
        <div className="modal-overlay">
          <div className="custom-modal forward-modal">
            <h3>Forward message to</h3>
            <div className="contact-list-modal">
              {users.map(u => (
                <div key={u._id} className="contact-list-item" onClick={() => confirmForwardMessage(u)}>
                  <div className="contact-avatar">{u.username.charAt(0).toUpperCase()}</div>
                  <span>{u.username}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setForwardMessageData(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Call modal */}
      <CallModal
        callState={callState}
        callData={callData}
        localStream={localStream}
        remoteStream={remoteStream}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
        onEndCall={handleEndCall}
      />

      {/* Error toast */}
      {error && (
        <div className="error-toast">
          {error}
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Message toasts */}
      {toastNotifications.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          sender={toast.sender}
          onClose={() => {
            setToastNotifications(prev => prev.filter(t => t.id !== toast.id));
          }}
        />
      ))}
    </div>
  );
};

export default ChatPage;
