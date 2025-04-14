const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'local' || !this.authProvider;
    }
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github', 'twitter'],
    default: 'local'
  },
  googleId: {
    type: String
  },
  githubId: {
    type: String
  },
  twitterId: {
    type: String
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  profilePicture: {
    type: String
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  onboarding: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema); 