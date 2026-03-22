const mongoose = require('mongoose');

const callSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    callType: {
      type: String,
      enum: ['audio', 'video'],
      required: true,
    },
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'accepted', 'declined', 'ended'],
      default: 'initiated',
    },
    duration: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Call', callSchema);
