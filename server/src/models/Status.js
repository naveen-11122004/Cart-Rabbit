const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    maxlength: 139,
    trim: true,
  },
  audioData: {
    type: String, // Base64 encoded audio
    default: null,
  },
  videoData: {
    type: String, // Base64 encoded video
    default: null,
  },
  mediaType: {
    type: String, // 'text', 'audio', 'video', 'text-audio', 'text-video'
    default: 'text',
  },
  viewers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
});

// TTL index — MongoDB will auto-delete documents after expiresAt
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Status', statusSchema);
