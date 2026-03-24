const ScheduledCall = require('../models/ScheduledCall');
const Message = require('../models/Message');

// Schedule a new call
exports.scheduleCall = async (req, res) => {
  try {
    const { 
      callerId, 
      receiverId, 
      title, 
      description, 
      startTime, 
      endTime, 
      callType 
    } = req.body;

    if (!callerId || !receiverId || !title || !startTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const scheduledCall = new ScheduledCall({
      callerId,
      receiverId,
      title,
      description,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      callType,
    });

    await scheduledCall.save();

    // After scheduling, automatically send a message to the chat
    const message = new Message({
      senderId: callerId,
      receiverId: receiverId,
      messageType: 'scheduled_call',
      content: JSON.stringify({
        callId: scheduledCall._id,
        title,
        startTime,
        endTime, // Added endTime
        callType,
      }),
      status: 'sent',
    });

    await message.save();

    res.status(201).json({ 
      message: 'Call scheduled successfully', 
      scheduledCall, 
      chatMessage: message 
    });
  } catch (error) {
    console.error('Error scheduling call:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get scheduled calls for a user
exports.getScheduledCalls = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const calls = await ScheduledCall.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
      status: 'pending',
      startTime: { $gte: new Date() }, // Only future calls
    }).sort({ startTime: 1 });

    res.status(200).json({ calls });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
