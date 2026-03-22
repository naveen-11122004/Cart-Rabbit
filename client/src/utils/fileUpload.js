import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

export const sendFileMessage = async (senderId, receiverId, file) => {
  const form = new FormData();
  form.append('senderId', senderId);
  form.append('receiverId', receiverId);
  form.append('file', file);

  const res = await axios.post(`${API}/api/messages/send-file`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const getFileUrl = (messageId) => `${API}/api/messages/file/${messageId}`;

export const getFileType = (mimetype = '') => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'document';
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};
