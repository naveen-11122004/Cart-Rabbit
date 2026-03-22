const Status = require('../models/Status');
const User = require('../models/User');

// Shared io reference — injected by socketHandler via setIo()
let _io = null;
const setIo = (io) => { _io = io; };

// POST /api/status
const postStatus = async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text || !text.trim()) {
      return res.status(400).json({ message: 'userId and text are required' });
    }
    if (text.trim().length > 139) {
      return res.status(400).json({ message: 'Status text must be 139 characters or fewer' });
    }

    const user = await User.findById(userId).select('username');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const status = await Status.create({
      userId,
      text: text.trim(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const payload = {
      statusId:  status._id,
      userId:    userId,
      username:  user.username,
      text:      status.text,
      createdAt: status.createdAt,
      expiresAt: status.expiresAt,
      viewers:   [],
    };

    // Broadcast to ALL connected clients
    if (_io) {
      _io.emit('newStatus', payload);
    }

    return res.status(201).json({ message: 'Status posted', status: payload });
  } catch (err) {
    console.error('postStatus error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/status/:userId?currentUserId=<id>
const getStatuses = async (req, res) => {
  try {
    const { userId } = req.params;           // the logged-in user
    const currentUserId = req.query.currentUserId || userId;
    const now = new Date();

    // My own statuses
    const myStatuses = await Status.find({
      userId: currentUserId,
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 }).lean();

    // Everyone else's statuses
    const others = await Status.find({
      userId: { $ne: currentUserId },
      expiresAt: { $gt: now },
    })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .lean();

    // Group by userId
    const grouped = {};
    for (const s of others) {
      const uid = s.userId._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = { user: { _id: s.userId._id, username: s.userId.username }, statuses: [] };
      }
      grouped[uid].statuses.push(s);
    }

    return res.json({
      myStatuses,
      othersStatuses: Object.values(grouped),
    });
  } catch (err) {
    console.error('getStatuses error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/status/:statusId/view  body: { currentUserId }
const markViewed = async (req, res) => {
  try {
    const { statusId } = req.params;
    const { currentUserId } = req.body;

    const status = await Status.findByIdAndUpdate(
      statusId,
      { $addToSet: { viewers: currentUserId } },
      { new: true }
    );

    if (!status) return res.status(404).json({ message: 'Status not found' });

    // Notify the owner that someone viewed their status
    if (_io) {
      _io.to(status.userId.toString()).emit('statusViewUpdate', {
        statusId,
        viewerId: currentUserId,
        viewCount: status.viewers.length,
      });
    }

    return res.json({ message: 'Marked as viewed', viewCount: status.viewers.length });
  } catch (err) {
    console.error('markViewed error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/status/:statusId  body: { userId }
const deleteStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const { userId } = req.body;

    const status = await Status.findById(statusId);
    if (!status) return res.status(404).json({ message: 'Status not found' });

    if (status.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await status.deleteOne();

    // Notify all clients to remove this status
    if (_io) {
      _io.emit('statusDeleted', { statusId, userId });
    }

    return res.json({ message: 'Status deleted' });
  } catch (err) {
    console.error('deleteStatus error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { postStatus, getStatuses, markViewed, deleteStatus, setIo };
