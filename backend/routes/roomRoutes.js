const express = require('express');
const router = express.Router();
const { Room, User } = require('../models');
const crypto = require('crypto');
const auth = require('../middleware/auth');

// Helper function to generate a secure meeting ID
const generateMeetingId = () => {
  // Generate 8 bytes of random data and convert to a readable string
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Helper function to generate a secure passcode
const generatePasscode = (length = 6) => {
  // Generate a numeric passcode of specified length
  return Math.floor(Math.pow(10, length-1) + Math.random() * 9 * Math.pow(10, length-1)).toString();
};

// Create a new room with secure ID and passcode
router.post('/', auth, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      isScheduled,
      startDateTime,
      duration,
      restrictToOrganization,
      organizationDomain,
      settings 
    } = req.body;
    
    // Generate meeting ID and passcode
    const meetingId = generateMeetingId();
    const passcode = generatePasscode();
    
    // Create the room
    const room = new Room({
      name,
      description,
      meetingId, // Store the friendly meeting ID
      passcode: settings?.requiresPassword ? settings.password : passcode,
      host: req.user.id, // Use authenticated user as host
      participants: [req.user.id],
      isActive: true,
      isScheduled,
      startDateTime: isScheduled ? startDateTime : new Date(),
      duration: duration || 60,
      settings: {
        ...settings,
        restrictToOrganization: restrictToOrganization || false,
        organizationDomain: organizationDomain || ''
      }
    });

    await room.save();
    
    // Add passcode to response if settings don't require a password
    const response = {
      ...room.toObject(),
      passcode: settings?.requiresPassword ? undefined : passcode
    };
    
    res.json(response);
  } catch (err) {
    console.error('Room creation error:', err.message);
    res.status(500).send('Server error');
  }
});

// Get all rooms for current user
router.get('/', auth, async (req, res) => {
  try {
    // Find rooms where user is host or participant
    const rooms = await Room.find({
      $or: [
        { host: req.user.id },
        { participants: req.user.id }
      ]
    }).populate('host', 'name email');
    
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Join a room with passcode verification
router.post('/:meetingId/join', auth, async (req, res) => {
  try {
    const { passcode } = req.body;
    console.log(`Join request for meeting ID: ${req.params.meetingId}`);
    
    // First try to find by meetingId (string format)
    let room = await Room.findOne({ meetingId: req.params.meetingId });
    
    // If not found and looks like MongoDB ID, try searching by _id
    if (!room && /^[0-9a-fA-F]{24}$/.test(req.params.meetingId)) {
      console.log("Trying to find room by MongoDB _id");
      room = await Room.findById(req.params.meetingId);
    }
    
    if (!room) {
      console.log(`Meeting not found: ${req.params.meetingId}`);
      return res.status(404).json({ message: 'Meeting not found', valid: false });
    }
    
    console.log(`Meeting found: ${room.name} (${room._id}), isActive: ${room.isActive}`);
    
    // Check if meeting is active
    if (!room.isActive) {
      return res.status(403).json({ message: 'Meeting is not active', valid: false });
    }
    
    // Check passcode if required
    if (room.passcode && room.passcode !== passcode) {
      console.log('Invalid passcode provided');
      return res.status(401).json({ message: 'Invalid passcode', valid: false });
    }
    
    // Check organization restriction if enabled
    if (room.settings?.restrictToOrganization && room.settings.organizationDomain) {
      const user = await User.findById(req.user.id);
      const userEmailDomain = user.email.split('@')[1];
      
      if (userEmailDomain !== room.settings.organizationDomain) {
        return res.status(403).json({ 
          message: `This meeting is restricted to ${room.settings.organizationDomain} email addresses`, 
          valid: false 
        });
      }
    }
    
    // Add user to participants if not already included
    if (!room.participants.includes(req.user.id)) {
      room.participants.push(req.user.id);
      await room.save();
      console.log(`Added user ${req.user.id} to participants`);
    }
    
    console.log(`User ${req.user.id} joined meeting ${room.meetingId}`);
    
    res.json({ 
      roomId: room._id,
      meetingId: room.meetingId,
      valid: true 
    });
  } catch (err) {
    console.error('Error joining room:', err);
    
    // Special case for invalid meeting ID format
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid meeting ID format', valid: false });
    }
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Validate room - check if exists and is active
router.get('/:meetingId/validate', auth, async (req, res) => {
  try {
    console.log(`Validating meeting ID: ${req.params.meetingId}`);
    
    // First try to find by meetingId (string format)
    let room = await Room.findOne({ meetingId: req.params.meetingId });
    
    // If not found and looks like MongoDB ID, try searching by _id
    if (!room && /^[0-9a-fA-F]{24}$/.test(req.params.meetingId)) {
      console.log("Trying to find room by MongoDB _id");
      room = await Room.findById(req.params.meetingId);
    }
    
    if (!room) {
      console.log(`Meeting not found: ${req.params.meetingId}`);
      return res.status(404).json({ message: 'Meeting not found', valid: false });
    }
    
    console.log(`Meeting found: ${room.name} (${room._id}), isActive: ${room.isActive}`);
    
    if (!room.isActive) {
      return res.status(403).json({ message: 'Meeting is not active', valid: false });
    }
    
    // Check if passcode is required
    const requiresPasscode = !!room.passcode;
    
    // Check organization restriction
    let organizationRestricted = false;
    let organizationDomain = null;
    
    if (room.settings?.restrictToOrganization && room.settings.organizationDomain) {
      organizationRestricted = true;
      organizationDomain = room.settings.organizationDomain;
      
      // Check if user is allowed
      const user = await User.findById(req.user.id);
      const userEmailDomain = user.email.split('@')[1];
      
      if (userEmailDomain !== organizationDomain) {
        return res.status(403).json({ 
          message: `This meeting is restricted to ${organizationDomain} email addresses`, 
          valid: false,
          organizationRestricted: true,
          organizationDomain
        });
      }
    }
    
    res.json({ 
      valid: true, 
      requiresPasscode,
      organizationRestricted,
      organizationDomain,
      roomId: room._id,
      meetingId: room.meetingId,
      isHost: room.host.toString() === req.user.id
    });
  } catch (err) {
    console.error('Error validating room:', err);
    
    // Special case for invalid meeting ID format
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Invalid meeting ID format', valid: false });
    }
    
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 