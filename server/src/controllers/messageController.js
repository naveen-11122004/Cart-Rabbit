const Message = require('../models/Message');

// Send a text message
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Validation
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Sender and receiver IDs are required' });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    // Create new message
    const message = new Message({
      senderId,
      receiverId,
      content,
    });

    await message.save();

    // Populate sender and receiver details
    await message.populate('senderId', 'username');
    await message.populate('receiverId', 'username');

    res.status(201).json({
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a file message (image, video, document)
exports.sendFileMessage = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Validation
    if (!senderId || !receiverId || !req.file) {
      return res.status(400).json({ message: 'Sender ID, Receiver ID, and file are required' });
    }

    // Create new message with file
    const message = new Message({
      senderId,
      receiverId,
      content: `Sent a ${req.file.mimetype.split('/')[0]}`,
      file: {
        data: req.file.buffer,
        mimetype: req.file.mimetype,
        filename: req.file.originalname,
        size: req.file.size,
      },
    });

    await message.save();

    // Populate sender and receiver details (don't send file data in response)
    await message.populate('senderId', 'username');
    await message.populate('receiverId', 'username');

    // Return message without file data
    const messageObj = message.toObject();
    if (messageObj.file) {
      messageObj.file.data = undefined;
    }

    res.status(201).json({
      message: 'File sent successfully',
      data: messageObj,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    // Validation
    if (!userId1 || !userId2) {
      return res.status(400).json({ message: 'Both user IDs are required' });
    }

    // Fetch messages between the two users
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    })
      .populate('senderId', 'username')
      .populate('receiverId', 'username')
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get file from message
exports.getFile = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message || !message.file || !message.file.data) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.set('Content-Type', message.file.mimetype);
    res.set('Content-Disposition', `attachment; filename="${message.file.filename}"`);
    res.send(message.file.data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.content = content;
    message.isEdited = true;
    await message.save();

    res.status(200).json({ message: 'Message edited successfully', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.isDeleted = true;
    message.content = 'This message was deleted';
    message.file = undefined;
    await message.save();

    res.status(200).json({ message: 'Message deleted successfully', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Star/Unstar a message
exports.starMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const index = message.starredBy.indexOf(userId);
    if (index === -1) {
      message.starredBy.push(userId);
    } else {
      message.starredBy.splice(index, 1);
    }
    
    await message.save();

    res.status(200).json({ message: 'Message star status updated', data: message });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
