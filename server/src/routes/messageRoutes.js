const express = require('express');
const multer = require('multer');
const { 
  sendMessage, 
  sendFileMessage, 
  getMessages, 
  getFile,
  editMessage,
  deleteMessage,
  starMessage
} = require('../controllers/messageController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
});

const router = express.Router();

router.post('/send', sendMessage);
router.post('/send-file', upload.single('file'), sendFileMessage);
router.get('/file/:messageId', getFile);
router.get('/:userId1/:userId2', getMessages);

router.put('/edit/:messageId', editMessage);
router.delete('/delete/:messageId', deleteMessage);
router.put('/star/:messageId', starMessage);

module.exports = router;
