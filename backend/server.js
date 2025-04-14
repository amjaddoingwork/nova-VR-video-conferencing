require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Room } = require('./models');
const mediaServer = require('./mediaServer');

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Socket.io Configuration
const io = socketio(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 120000
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/organizations', require('./routes/orgRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/onboarding', require('./routes/onboardingRoutes'));
app.use('/api/account', require('./routes/accountRoutes'));

// Database Connection Function
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in Mongoose 6+
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    });
    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Map to track active users in rooms (for faster lookup)
const activeUsers = new Map(); // Map<socketId, { userId, roomId }>
const roomParticipants = new Map(); // Map<roomId, Set<socketId>>

// Socket.io Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    // MODIFY: Allow guest connections
    if (!token) {
      console.log('👥 Guest user connecting (no token provided)');
      socket.isGuest = true;
      socket.user = { 
        _id: 'guest-' + socket.id.substring(0, 8),
        name: 'Guest',
        email: 'guest@example.com',
        isGuest: true
      };
      return next();
    }
    
    // Extract token from Bearer format if present
    const tokenString = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    try {
      const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      socket.user = user;
      next();
    } catch (verifyError) {
      console.error('Socket.io token verification error:', verifyError);
      next(new Error('Authentication error: Invalid token'));
    }
  } catch (err) {
    console.error('Socket.io authentication error:', err);
    next(new Error('Authentication error'));
  }
});

// Socket.io Event Handlers
io.on('connection', (socket) => {
  console.log(`💡 New connection: ${socket.user.email}`);

  // Room Management
  socket.on('joinRoom', async (meetingId, participantData = {}) => {
    try {
      // MODIFY: Handle guest users with custom data
      if (socket.isGuest && participantData) {
        if (participantData.name) {
          socket.user.name = participantData.name;
        }
        if (participantData.id) {
          socket.user._id = participantData.id;
        }
      }

      // Find room by meetingId
      const room = await Room.findOne({ 
        $or: [
          { meetingId },
          { _id: meetingId }  // fallback to support MongoDB _id
        ]
      });
      
      if (!room) {
        // MODIFY: Create room for guests if it doesn't exist
        if (socket.isGuest) {
          console.log(`Creating temporary room for guest: ${meetingId}`);
          // Create a temporary in-memory room
          const tempRoom = {
            _id: meetingId,
            meetingId: meetingId,
            isActive: true,
            participants: [socket.user._id],
            isTemporary: true
          };
          
          socket.roomId = tempRoom._id.toString();
          socket.meetingId = tempRoom.meetingId;
          
          // Add to our tracking maps
          activeUsers.set(socket.id, {
            userId: socket.user._id.toString(),
            roomId: tempRoom._id.toString(),
            userName: socket.user.name,
            email: socket.user.email || 'guest@example.com'
          });
          
          // Create room participants set
          if (!roomParticipants.has(tempRoom._id.toString())) {
            roomParticipants.set(tempRoom._id.toString(), new Set());
          }
          roomParticipants.get(tempRoom._id.toString()).add(socket.id);
          
          // Join Socket.io room
          socket.join(tempRoom._id.toString());
          
          // No existing participants for a new room
          socket.emit('existingParticipants', []);
          
          // Emit roomJoined event
          socket.emit('roomJoined');
          
          console.log(`Guest ${socket.user.name} created and joined room ${meetingId}`);
          return;
        } else {
          return socket.emit('error', { 
            message: 'Meeting not found. Please check the meeting ID and try again.' 
          });
        }
      }
      
      if (!room.isActive) {
        return socket.emit('error', { 
          message: 'This meeting is no longer active.' 
        });
      }
      
      // Store the room details and user mapping
      socket.roomId = room._id.toString();
      socket.meetingId = room.meetingId;
      
      // Add user to participants if not already included and not a guest
      if (!socket.isGuest) {
        const isParticipant = room.participants.some(p => 
          p.toString() === socket.user._id.toString()
        );
        
        if (!isParticipant) {
          room.participants.push(socket.user._id);
          await room.save();
        }
      }
      
      // Add to our tracking maps
      activeUsers.set(socket.id, {
        userId: socket.user._id.toString(),
        roomId: room._id.toString(),
        userName: socket.user.name || socket.user.email,
        email: socket.user.email,
        isGuest: socket.isGuest
      });
      
      // Create or get the room participants set
      if (!roomParticipants.has(room._id.toString())) {
        roomParticipants.set(room._id.toString(), new Set());
      }
      roomParticipants.get(room._id.toString()).add(socket.id);
      
      // Join Socket.io room
      socket.join(room._id.toString());
      
      // Get existing participants
      const participants = [];
      const participantsSockets = roomParticipants.get(room._id.toString());
      
      for (const participantSocketId of participantsSockets) {
        // Don't include the current user
        if (participantSocketId !== socket.id) {
          const user = activeUsers.get(participantSocketId);
          if (user) {
            participants.push({
              id: participantSocketId, // Use socket ID for direct WebRTC communication
              userId: user.userId,
              name: user.userName,
              email: user.email,
              isGuest: user.isGuest
            });
          }
        }
      }
      
      // Send existing participants to the new user
      socket.emit('existingParticipants', participants);
      
      // Notify other users about this new participant
      socket.to(room._id.toString()).emit('newParticipant', {
        id: socket.id, // Use socket ID for direct WebRTC communication
        userId: socket.user._id.toString(),
        name: socket.user.name,
        email: socket.user.email,
        isGuest: socket.isGuest
      });

      // Send roomJoined event to confirm successful join
      socket.emit('roomJoined');
      
      console.log(`User ${socket.user.name || socket.user.email} joined room ${room.meetingId}`);
    } catch (err) {
      console.error('Error in joinRoom:', err);
      socket.emit('error', { message: err.message });
    }
  });
  
  // Leave room
  socket.on('leaveRoom', async () => {
    try {
      handleUserLeaving(socket);
    } catch (err) {
      console.error('Error in leaveRoom:', err);
    }
  });

  // Chat Messages
  socket.on('chatMessage', async (data) => {
    try {
      const { roomId, message } = data;
      
      // Check if user is in this room
      const userInfo = activeUsers.get(socket.id);
      if (!userInfo) {
        return socket.emit('error', { message: 'Not authorized or not in a room' });
      }
      
      // Use the roomId from user data if not provided in message
      const targetRoomId = roomId || userInfo.roomId;
      
      // Validate user is in this room
      if (userInfo.roomId !== targetRoomId) {
        return socket.emit('error', { message: 'Not in this room' });
      }
      
      // Ensure message has an ID
      if (!message.id) {
        message.id = Date.now().toString();
      }
      
      // Add sender information if missing
      if (!message.senderId) {
        message.senderId = socket.id;
      }
      
      if (!message.senderName) {
        message.senderName = socket.user.name || socket.user.email || 'Unknown User';
      }
      
      // Add timestamp if missing
      if (!message.timestamp) {
        message.timestamp = new Date().toISOString();
      }
      
      // Broadcast to other users in the room
      socket.to(targetRoomId).emit('chatMessage', message);
      
      console.log(`Chat message sent in room ${targetRoomId} by ${socket.user.email || 'guest'}`);
    } catch (err) {
      console.error('Error in chatMessage:', err);
      socket.emit('error', { message: err.message });
    }
  });

  // Handle message read receipts
  socket.on('messageRead', (data) => {
    try {
      const { roomId, messageId } = data;
      
      // Check if user is in this room
      const userInfo = activeUsers.get(socket.id);
      if (!userInfo) {
        return;
      }
      
      // Use the roomId from user data if not provided
      const targetRoomId = roomId || userInfo.roomId;
      
      // Validate user is in this room
      if (userInfo.roomId !== targetRoomId) {
        return;
      }
      
      // Broadcast read receipt to all users in the room
      socket.to(targetRoomId).emit('messageRead', {
        messageId,
        readBy: socket.id,
        readerName: socket.user.name || socket.user.email
      });
      
    } catch (err) {
      console.error('Error in messageRead:', err);
    }
  });

  // Media Status Updates
  socket.on('mediaStatusChange', (data) => {
    try {
      const { audio, video } = data;
      
      const userInfo = activeUsers.get(socket.id);
      if (!userInfo) {
        return;
      }
      
      // Broadcast media status change to other users in the room
      socket.to(userInfo.roomId).emit('mediaStatusChange', {
        participantId: socket.id,
        audio,
        video
      });
    } catch (err) {
      console.error('Error in mediaStatusChange:', err);
    }
  });
  
  // Screen Sharing Status
  socket.on('screenShareChange', (data) => {
    try {
      const { sharing } = data;
      
      const userInfo = activeUsers.get(socket.id);
      if (!userInfo) {
        return;
      }
      
      // Broadcast screen share status to other users in the room
      socket.to(userInfo.roomId).emit('screenShareChange', {
        participantId: socket.id,
        sharing
      });
    } catch (err) {
      console.error('Error in screenShareChange:', err);
    }
  });

  // WebRTC
  socket.on('connectTransport', async ({ dtlsParameters }) => {
    try {
      if (!socket.transport) {
        throw new Error('Transport not initialized');
      }
      await socket.transport.connect({ dtlsParameters });
    } catch (error) {
      console.error('Transport connect error:', error);
      socket.emit('error', { 
        message: 'Failed to connect transport',
        details: error.message 
      });
    }
  });

  socket.on('produce', async ({ kind, rtpParameters }) => {
    try {
      if (!socket.transport) {
        throw new Error('Transport not initialized');
      }
      const producer = await socket.transport.produce({ kind, rtpParameters });
      socket.producer = producer;
      
      // Notify other participants about new producer
      socket.to(socket.roomId).emit('newProducer', {
        producerId: producer.id,
        userId: socket.user._id,
        kind
      });
    } catch (err) {
      console.error('Produce error:', err);
      socket.emit('error', { message: err.message });
    }
  });

  // WebRTC Signaling
  socket.on('offer', async (data) => {
    try {
      const { target, offer } = data;
      console.log(`Relaying offer from ${socket.user.email} to ${target}`);
      
      // Relay the offer to the target participant
      socket.to(target).emit('offer', {
        sender: socket.id,
        offer
      });
    } catch (err) {
      console.error('Error in offer:', err);
      socket.emit('error', { message: 'Failed to relay offer' });
    }
  });

  socket.on('answer', async (data) => {
    try {
      const { target, answer } = data;
      console.log(`Relaying answer from ${socket.user.email} to ${target}`);
      
      // Relay the answer to the target participant
      socket.to(target).emit('answer', {
        sender: socket.id,
        answer
      });
    } catch (err) {
      console.error('Error in answer:', err);
      socket.emit('error', { message: 'Failed to relay answer' });
    }
  });

  socket.on('ice-candidate', (data) => {
    try {
      const { target, candidate } = data;
      console.log(`Relaying ICE candidate from ${socket.user.email} to ${target}`);
      
      // Relay the ICE candidate to the target participant
      socket.to(target).emit('ice-candidate', {
        sender: socket.id,
        candidate
      });
    } catch (err) {
      console.error('ICE Candidate error:', err);
      socket.emit('error', { message: 'Failed to relay ICE candidate' });
    }
  });

  // WebRTC signaling events
  socket.on('sendOffer', ({ to, offer }) => {
    console.log(`Relaying offer from ${socket.id} to ${to}`);
    io.to(to).emit('receiveOffer', {
      from: socket.id,
      offer
    });
  });

  socket.on('sendAnswer', ({ to, answer }) => {
    console.log(`Relaying answer from ${socket.id} to ${to}`);
    io.to(to).emit('receiveAnswer', {
      from: socket.id,
      answer
    });
  });

  socket.on('sendICECandidate', ({ to, candidate }) => {
    io.to(to).emit('receiveICECandidate', {
      from: socket.id,
      candidate
    });
  });

  // WebRTC Signaling (add this after the chatMessage handler)
  socket.on('signal', (data) => {
    try {
      const { toId, signal } = data;
      
      // Forward the signal to the specified recipient
      socket.to(toId).emit('signal', {
        fromId: socket.id,
        signal
      });
      
      // For debugging
      // console.log(`Signal from ${socket.id} to ${toId}`);
    } catch (err) {
      console.error('Error in signal handler:', err);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.user.email}, Reason: ${reason}`);
    
    // Handle room cleanup if disconnected while in a room
    handleUserLeaving(socket);
  });
});

// Helper function to handle a user leaving
const handleUserLeaving = (socket) => {
  const userInfo = activeUsers.get(socket.id);
  if (!userInfo) return;
  
  const { roomId } = userInfo;
  
  // Notify other participants
  socket.to(roomId).emit('participantLeft', socket.id);
  
  // Remove from tracking maps
  activeUsers.delete(socket.id);
  
  const roomUsers = roomParticipants.get(roomId);
  if (roomUsers) {
    roomUsers.delete(socket.id);
    if (roomUsers.size === 0) {
      roomParticipants.delete(roomId);
    }
  }
  
  // Leave Socket.io room
  socket.leave(roomId);
  
  console.log(`User ${socket.user.email} left room ${roomId}`);
};

// Helper Functions
const getRoomParticipants = async (roomId) => {
  try {
    // Try to use in-memory cache first for active participants
    if (roomParticipants.has(roomId)) {
      const participantSockets = roomParticipants.get(roomId);
      const participants = [];
      
      for (const socketId of participantSockets) {
        const user = activeUsers.get(socketId);
        if (user) {
          participants.push({
            id: socketId,
            userId: user.userId,
            name: user.userName,
            email: user.email
          });
        }
      }
      
      return participants;
    }
    
    // Fallback to database lookup
    const room = await Room.findById(roomId)
      .populate('participants', 'email name')
      .lean();
      
    if (!room) {
      console.error('Room not found:', roomId);
      return [];
    }

    return room.participants.map(user => ({
      id: user._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      name: user.name
    }));
  } catch (err) {
    console.error('Error fetching participants:', err);
    return [];
  }
};

// Add process handlers
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Cleaning up...');
  await mediaServer.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Cleaning up...');
  await mediaServer.cleanup();
  process.exit(0);
});

// Connect to Database and Start Server
connectDB().then(async () => {
  try {
    // Wait for MediaServer to initialize
    await mediaServer.initPromise;
    console.log('MediaServer is ready');
    
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

module.exports = { app, server, io };