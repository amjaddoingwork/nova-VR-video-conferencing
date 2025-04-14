const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  meetingId: {
    type: String,
    required: true,
    unique: true
  },
  passcode: {
    type: String
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  startDateTime: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    default: 60 // duration in minutes
  },
  settings: {
    waitingRoom: {
      type: Boolean,
      default: false
    },
    hostVideo: {
      type: Boolean,
      default: true
    },
    participantVideo: {
      type: Boolean,
      default: true
    },
    muteOnEntry: {
      type: Boolean,
      default: true
    },
    allowRecording: {
      type: Boolean,
      default: true
    },
    requiresPassword: {
      type: Boolean,
      default: false
    },
    restrictToOrganization: {
      type: Boolean,
      default: false
    },
    organizationDomain: {
      type: String,
      default: ''
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', RoomSchema); 