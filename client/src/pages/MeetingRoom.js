import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Badge,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  useTheme,
  alpha,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
  CallEnd as CallEndIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Send as SendIcon,
  PresentToAll as PresentToAllIcon,
  Fullscreen as FullscreenIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Link as LinkIcon,
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
  ViewInAr as ViewInArIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';
import RemoteParticipant from '../components/RemoteParticipant';
import MeetingView from '../components/MeetingView';
import { getGuestData, isGuestUser } from '../utils/temporaryAuth';

const MeetingRoom = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { currentUser } = useAuth();
  
  // References
  const socketRef = useRef();
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  const localStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [activeParticipants, setActiveParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVRMode, setIsVRMode] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState({
    title: 'Meeting',
    duration: '00:00:00',
    participants: 0,
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [peerConnections, setPeerConnections] = useState({});
  const [participants, setParticipants] = useState([]);
  const [localParticipant, setLocalParticipant] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isGuest, setIsGuest] = useState(false); // Track if user is a guest

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const closeNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Toggle VR mode
  const toggleVRMode = () => {
    setIsVRMode(!isVRMode);
  };

  // Function to update or add participant data, including their stream
  const updateParticipant = (participantId, updates) => {
    setParticipants(prev => {
      const existing = prev.find(p => p.id === participantId);
      if (existing) {
        // Update existing participant
        return prev.map(p => p.id === participantId ? { ...p, ...updates } : p);
      } else {
        // Add new participant (should ideally have metadata first)
        // This path might need refinement depending on signaling flow
        console.warn('Adding participant directly from stream update:', participantId);
        return [...prev, { id: participantId, ...updates }];
      }
    });
  };

  // Setup WebRTC
  useEffect(() => {
    let startTime;
    let durationInterval;
    
    // Modified Auth Check to support custom guest token
    let userToken = localStorage.getItem('token');
    let guestMode = false;
    let userId, userName;

    // Check for standard token first
    if (!userToken) {
      // No standard token, check for guest token
      const guestData = getGuestData();
      if (guestData) {
        console.log('Using guest credentials:', guestData);
        guestMode = true;
        setIsGuest(true);
        userId = guestData.id;
        userName = guestData.name;
        userToken = null; // Explicitly set token to null for guest
      } else {
        // No guest token either, redirect to login
        console.error('No authentication token or guest token found');
        setAuthError('Authentication required. Please log in or join as guest.');
        setIsLoading(false);
        return;
      }
    } else {
      // Standard token exists
      setIsGuest(false);
      userId = currentUser?.uid || 'user-' + Math.random().toString(36).substring(2, 9);
      userName = currentUser?.displayName || 'User';
    }

    const setupMediaConnection = async (currentUserId, currentUserName, currentIsGuest) => {
      try {
        console.log('🔄 Setting up media connection...', { userId: currentUserId, userName: currentUserName, isGuest: currentIsGuest });
        
        // Create empty stream first as a backup
        let stream = new MediaStream();
        let videoEnabled = false;
        let audioEnabled = false;
        
        // Create a function to handle attempts to get media with retries
        const getMediaWithRetry = async (constraints, retryCount = 3, label = 'media') => {
          for (let attempt = 1; attempt <= retryCount; attempt++) {
            try {
              console.log(`📷 Requesting ${label} access (attempt ${attempt}/${retryCount})...`);
              // Add timeout to prevent hanging
              const mediaPromise = navigator.mediaDevices.getUserMedia(constraints);
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`${label} access timeout`)), 5000);
              });
              
              // Race the promises
              const result = await Promise.race([mediaPromise, timeoutPromise]);
              console.log(`✅ Got ${label} access successfully`);
              return result;
            } catch (err) {
              console.warn(`⚠️ Error accessing ${label} (attempt ${attempt}/${retryCount}):`, err.message);
              
              if (attempt === retryCount) {
                throw err; // Rethrow on final attempt
              }
              
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        };
        
        try {
          // Try getting both video and audio first
          stream = await getMediaWithRetry({ audio: true, video: true }, 2, 'camera and microphone');
          videoEnabled = stream.getVideoTracks().length > 0;
          audioEnabled = stream.getAudioTracks().length > 0;
          
          // Verify tracks are working
          if (videoEnabled) {
            console.log('✅ Video track obtained:', stream.getVideoTracks()[0].label);
            // Add a setting to optimize for performance
            const videoTrack = stream.getVideoTracks()[0];
            try {
              const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
              const constraints = {};
              
              if (supportedConstraints.width && supportedConstraints.height) {
                constraints.width = { ideal: 640 };
                constraints.height = { ideal: 480 };
              }
              
              if (supportedConstraints.frameRate) {
                constraints.frameRate = { max: 30 };
              }
              
              if (Object.keys(constraints).length > 0) {
                await videoTrack.applyConstraints(constraints);
                console.log('✅ Applied optimized video constraints');
              }
            } catch (constraintErr) {
              console.warn('⚠️ Could not apply video constraints:', constraintErr);
            }
          }
          
          if (audioEnabled) {
            console.log('✅ Audio track obtained:', stream.getAudioTracks()[0].label);
            // Can add audio constraints here if needed
          }
          
        } catch (err) {
          console.warn('⚠️ Error accessing full media:', err.message);
          
          // Fall back to just video if both failed
          try {
            stream = await getMediaWithRetry({ video: true, audio: false }, 2, 'video-only');
            videoEnabled = true;
            console.log('✅ Fallback to video-only successful');
          } catch (videoErr) {
            console.warn('⚠️ Video-only fallback failed:', videoErr.message);
            
            // Final fallback to just audio
            try {
              stream = await getMediaWithRetry({ audio: true, video: false }, 2, 'audio-only');
              audioEnabled = true;
              console.log('✅ Fallback to audio-only successful');
            } catch (audioErr) {
              console.warn('⚠️ Audio-only fallback failed:', audioErr.message);
              showNotification('Could not access camera or microphone. Check permissions.', 'warning');
              // Continue with empty stream
            }
          }
        }
        
        // Set UI state based on what we got
        setIsVideoOff(!videoEnabled);
        setIsMuted(!audioEnabled);
        
        // Log a summary of what we've got
        console.log('📊 Media status summary:', {
          videoEnabled,
          audioEnabled,
          videoTrackCount: stream.getVideoTracks().length,
          audioTrackCount: stream.getAudioTracks().length
        });
        
        // Create local participant with whatever stream we have
        const ownParticipantData = {
          id: currentUserId,
          name: currentUserName,
          isLocal: true,
          stream: stream,
          isMuted: !audioEnabled,
          isVideoOff: !videoEnabled,
        };
        
        setLocalParticipant(ownParticipantData);
        localStreamRef.current = stream;
        
        // Set up video element if we have one
        if (localVideoRef.current) {
          console.log('🎥 Setting up local video element');
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true; // Always mute local video
          
          // Add event listeners for debugging
          localVideoRef.current.onloadedmetadata = () => {
            console.log('🎥 Local video loadedmetadata event fired');
          };
          
          localVideoRef.current.onplay = () => {
            console.log('▶️ Local video play event fired');
          };
          
          localVideoRef.current.onerror = (err) => {
            console.error('❌ Local video error:', err);
          };
          
          // Attempt to play the video
          try {
            await localVideoRef.current.play();
            console.log('▶️ Local video playing successfully');
          } catch (err) {
            console.warn('⚠️ Auto-play failed for local video:', err);
            
            // Try to recover by setting muted if autoplay was blocked
            if (err.name === 'NotAllowedError') {
              console.log('🔇 Trying to play with explicit user interaction required notification');
              showNotification('Please click to enable video playback', 'info');
            }
          }
        }
        
        // Set up socket connection (simplified)
        const socketUrl = 'http://localhost:5000';
        console.log('🔌 Connecting to socket at', socketUrl);
        
        // Create socket without auth for debugging
        const socket = io(socketUrl, {
          reconnection: true,
          reconnectionAttempts: 5,
          timeout: 10000
        });
        
        socketRef.current = socket;
        
        // Handle socket events
        socket.on('connect', () => {
          console.log('✅ Socket connected, joining room:', roomId);
          socket.emit('joinRoom', roomId, {
            id: ownParticipantData.id,
            name: ownParticipantData.name,
            isGuest: true // Force guest mode for testing
          });
          
          // Setup signaling handlers once socket is connected
          setupSignalingHandlers(socket, stream);
          
          // Force complete loading after connection
          setTimeout(() => {
            console.log('🎯 Force completing setup after connection');
            setIsLoading(false);
          }, 1000);
        });
        
        socket.on('connect_error', (err) => {
          console.error('❌ Socket connection error:', err);
          showNotification('Connection error: ' + err.message, 'error');
          
          // Still complete the loading process to show the UI
          setTimeout(() => {
            console.log('🎯 Force completing setup after connection error');
            setIsLoading(false);
          }, 500);
        });
        
        // Auto-complete loading after a timeout
        setTimeout(() => {
          if (isLoading) {
            console.log('⏱️ Timeout reached, force completing setup');
            setIsLoading(false);
          }
        }, 5000);
        
      } catch (err) {
        console.error('❌ Fatal error in media setup:', err);
        showNotification('Setup error: ' + err.message, 'error');
        
        // Don't get stuck
        setIsLoading(false);
      }
    };
    
    // Improved signaling handler setup with debugging
    const setupSignalingHandlers = (socket, localUserStream) => {
      console.log('🔄 Setting up signaling handlers');
      
      socket.on('existingParticipants', (participantsData) => {
        console.log('👥 Received existing participants data:', participantsData);
        // Initialize participants state WITHOUT streams initially
        setParticipants(participantsData.map(p => ({ ...p, stream: null, isMuted: true, isVideoOff: true })));

        if (participantsData.length > 0) {
          console.log('🔄 Creating peer connections for existing participants');
          participantsData.forEach(participant => {
            createPeerConnection(participant.id, localUserStream, socket, true); 
          });
        } else {
          console.log('ℹ️ No other participants in the room');
        }
      });
      
      socket.on('newParticipant', (participantData) => {
        console.log('👤 New participant joined:', participantData);
        // Add participant WITHOUT stream initially
        setParticipants(prev => [...prev, { ...participantData, stream: null, isMuted: true, isVideoOff: true }]);
        
        // Pass participant ID
        console.log('🔄 Creating peer connection for new participant');
        createPeerConnection(participantData.id, localUserStream, socket, false);
      });
      
      socket.on('participantLeft', (participantId) => {
        console.log('👋 Participant left:', participantId);
        setParticipants(prev => prev.filter(p => p.id !== participantId));
        if (peerConnectionsRef.current[participantId]) {
          console.log('🔌 Closing peer connection for departed participant');
          peerConnectionsRef.current[participantId].close();
          delete peerConnectionsRef.current[participantId];
        }
      });
      
      // Handle signaling messages (Offer, Answer, ICE Candidate)
      socket.on('signal', async ({ fromId, signal }) => {
        console.log(`📡 Received signal from ${fromId}:`, signal.type || 'ICE candidate');
        const pc = peerConnectionsRef.current[fromId];
        if (!pc) {
          console.warn(`⚠️ Received signal for non-existent peer connection: ${fromId}`);
          return;
        }

        try {
          if (signal.type === 'offer') {
            console.log(`📥 Processing offer from ${fromId}`);
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log(`📤 Sending answer to ${fromId}`);
            socket.emit('signal', { toId: fromId, signal: pc.localDescription });
          } else if (signal.type === 'answer') {
            console.log(`📥 Setting remote description (answer) from ${fromId}`);
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
          } else if (signal.candidate) {
            console.log(`📥 Adding ICE candidate from ${fromId}`);
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        } catch (error) {
          console.error(`❌ Error handling signal from ${fromId}:`, error);
        }
      });
    };
    
    // Improved peer connection creation with better ICE configuration
    const createPeerConnection = (remoteParticipantId, localUserStream, socket, isInitiator) => {
      console.log(`🔄 Creating peer connection for ${remoteParticipantId}, Initiator: ${isInitiator}`);
      if (peerConnectionsRef.current[remoteParticipantId]) {
        console.warn(`⚠️ Peer connection for ${remoteParticipantId} already exists, closing old one.`);
        peerConnectionsRef.current[remoteParticipantId].close();
      }

      try {
        console.log(`🔌 Setting up new RTCPeerConnection for ${remoteParticipantId}`);
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ],
          iceCandidatePoolSize: 10
        });
        peerConnectionsRef.current[remoteParticipantId] = pc;

        // Add local stream tracks
        if (localUserStream && localUserStream.getTracks().length > 0) {
          console.log(`📤 Adding ${localUserStream.getTracks().length} local tracks to peer connection`);
          localUserStream.getTracks().forEach(track => {
            pc.addTrack(track, localUserStream);
            console.log(`➕ Added local ${track.kind} track for ${remoteParticipantId}`);
          });
        } else {
          console.warn('⚠️ No local tracks to add to peer connection');
        }

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          console.log(`🔄 Connection state for ${remoteParticipantId}: ${pc.connectionState}`);
        };

        // Handle ICE connection state changes
        pc.oniceconnectionstatechange = () => {
          console.log(`🧊 ICE connection state for ${remoteParticipantId}: ${pc.iceConnectionState}`);
          if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'closed') {
            console.error(`❌ ICE connection for ${remoteParticipantId} failed or closed: ${pc.iceConnectionState}`);
            
            // Consider restarting ICE if it failed
            if (pc.iceConnectionState === 'failed') {
              console.log(`🔄 Attempting to restart ICE for ${remoteParticipantId}`);
              pc.restartIce?.();
            }
          }
        };

        // ICE gathering state changes
        pc.onicegatheringstatechange = () => {
          console.log(`🧊 ICE gathering state for ${remoteParticipantId}: ${pc.iceGatheringState}`);
        };

        // Key Change: Handle incoming tracks
        pc.ontrack = (event) => {
          console.log(`📥 Received remote ${event.track.kind} track from ${remoteParticipantId}`);
          if (event.streams && event.streams[0]) {
            const remoteStream = event.streams[0];
            console.log(`📡 Assigning remote stream from ${remoteParticipantId}:`, {
              id: remoteStream.id,
              tracks: remoteStream.getTracks().map(t => t.kind).join(', ')
            });
            
            // Update the specific participant in the state with their stream
            updateParticipant(remoteParticipantId, { 
              stream: remoteStream,
              isMuted: !remoteStream.getAudioTracks()[0]?.enabled,
              isVideoOff: !remoteStream.getVideoTracks()[0]?.enabled
            });
          } else {
            console.warn(`⚠️ No streams found on track event from ${remoteParticipantId}`);
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log(`📤 Sending ICE candidate to ${remoteParticipantId}`);
            socket.emit('signal', { 
              toId: remoteParticipantId, 
              signal: { candidate: event.candidate } 
            });
          }
        };

        // If initiator, create offer
        if (isInitiator) {
          console.log(`📤 Creating offer for ${remoteParticipantId}`);
          pc.createOffer()
            .then(offer => {
              console.log(`📄 Setting local description (offer) for ${remoteParticipantId}`);
              return pc.setLocalDescription(offer);
            })
            .then(() => {
              console.log(`📤 Sending offer to ${remoteParticipantId}`);
              socket.emit('signal', { toId: remoteParticipantId, signal: pc.localDescription });
            })
            .catch(error => console.error(`❌ Error creating offer for ${remoteParticipantId}:`, error));
        }
        
        return pc;
      } catch (error) {
        console.error(`❌ Failed to create peer connection for ${remoteParticipantId}:`, error);
        return null;
      }
    };
    
    // Start setup with user or guest credentials
    setupMediaConnection(userId, userName, guestMode);
    
    // Cleanup function
    return () => {
      // Close all peer connections
      Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
      peerConnectionsRef.current = {};
      
      // Stop all local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      // Clear intervals
      if (durationInterval) {
        clearInterval(durationInterval);
      }
    };
  }, [roomId, currentUser, navigate]);

  // Add a timeout to automatically proceed after 10 seconds
  useEffect(() => {
    if (isLoading) {
      // Set a timeout to automatically proceed after 10 seconds if stuck
      const timer = setTimeout(() => {
        if (isLoading) {
          console.log('⚠️ Setup process taking too long, proceeding anyway');
          setIsLoading(false);
        }
      }, 10000); // 10 seconds timeout
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const muted = !audioTrack.enabled;
        setIsMuted(muted);
        // Update local participant state
        setLocalParticipant(prev => prev ? {...prev, isMuted: muted} : null);
        // Send mute status to others (optional, depends on signaling design)
        // socketRef.current?.emit('updateMediaStatus', { isMuted: muted });
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const videoOff = !videoTrack.enabled;
        setIsVideoOff(videoOff);
        // Update local participant state
        setLocalParticipant(prev => prev ? {...prev, isVideoOff: videoOff} : null);
        // Send video status to others (optional)
        // socketRef.current?.emit('updateMediaStatus', { isVideoOff: videoOff });
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (localStreamRef.current) {
          const videoTracks = localStreamRef.current.getVideoTracks();
          videoTracks.forEach(track => track.stop());
        }
        
        // Get user media again
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: localStreamRef.current ? 
            localStreamRef.current.getAudioTracks().length > 0 : true
        });
        
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        // Keep audio from original stream
        if (localStreamRef.current) {
          const audioTracks = localStreamRef.current.getAudioTracks();
          audioTracks.forEach(track => {
            screenStream.addTrack(track);
          });
        }
        
        localStreamRef.current = screenStream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Listen for user ending screen share
        screenStream.getVideoTracks()[0].onended = async () => {
          // User ended screen sharing via browser UI
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: localStreamRef.current ? 
              localStreamRef.current.getAudioTracks().length > 0 : true
          });
          
          localStreamRef.current = stream;
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          
          setIsScreenSharing(false);
        };
        
        setIsScreenSharing(true);
      }
      
      // Notify server about screen sharing status change
      if (socketRef.current) {
        socketRef.current.emit('screenShareChange', {
          sharing: !isScreenSharing
        });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      showNotification('Failed to share screen. Please try again.', 'error');
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (isChatOpen) {
      setIsParticipantsOpen(false);
    }
  };

  const toggleParticipants = () => {
    setIsParticipantsOpen(!isParticipantsOpen);
    if (isParticipantsOpen) {
      setIsChatOpen(false);
    }
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();  // Prevent form submission refresh
    
    if (newMessage.trim() && socketRef.current) {
      const messageId = Date.now().toString(); // Generate unique ID for the message
      const messageData = {
        roomId: roomId, // Add roomId for server validation
        message: {
          id: messageId,
          senderId: localParticipant?.id,
          senderName: localParticipant?.name,
          text: newMessage,
          timestamp: new Date().toISOString(),
          read: false
        }
      };
      
      // Send message to server
      socketRef.current.emit('chatMessage', messageData);
      
      // Add message to local state with read status
      setChatMessages(prev => [...prev, { 
        ...messageData.message, 
        isLocal: true,
        sent: true,
        read: true
      }]);
      
      // Clear input
      setNewMessage('');
    }
  };

  const handleEndCall = () => {
    // Notify server that user is leaving the room
    if (socketRef.current) {
      socketRef.current.emit('leaveRoom', roomId);
    }
    
    navigate('/dashboard');
  };

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    showNotification('Meeting link copied to clipboard');
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const handleNewMessage = (messageData) => {
      console.log('Received chat message:', messageData);
      
      // Check if message already exists in chat (prevents duplicates)
      const messageExists = chatMessages.some(msg => 
        msg.id === messageData.id || 
        (msg.timestamp === messageData.timestamp && msg.senderId === messageData.senderId)
      );
      
      if (!messageExists) {
        // Add new message with unread status
        setChatMessages(prev => [...prev, { 
          ...messageData, 
          isLocal: false,
          read: false
        }]);
        
        // Show notification if chat is closed
        if (!isChatOpen) {
          showNotification(`New message from ${messageData.senderName || 'Someone'}`);
        }
        
        // If chat is open, mark as read and send read receipt
        if (isChatOpen && socketRef.current) {
          socketRef.current.emit('messageRead', {
            roomId: roomId,
            messageId: messageData.id
          });
        }
      }
    };
    
    // Handle read receipts
    const handleMessageRead = (data) => {
      // Update read status for messages
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId ? { ...msg, read: true } : msg
        )
      );
    };
    
    socketRef.current?.on('chatMessage', handleNewMessage);
    socketRef.current?.on('messageRead', handleMessageRead);
    
    return () => {
      socketRef.current?.off('chatMessage', handleNewMessage);
      socketRef.current?.off('messageRead', handleMessageRead);
    };
  }, [isChatOpen, chatMessages, roomId]); // Add dependencies to re-run when chat visibility changes

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (isChatOpen && socketRef.current) {
      // Get unread messages
      const unreadMessages = chatMessages.filter(msg => !msg.read && !msg.isLocal);
      
      // Mark each as read and send read receipts
      unreadMessages.forEach(msg => {
        socketRef.current.emit('messageRead', {
          roomId: roomId,
          messageId: msg.id
        });
      });
      
      // Update local read status
      if (unreadMessages.length > 0) {
        setChatMessages(prev => 
          prev.map(msg => !msg.isLocal ? { ...msg, read: true } : msg)
        );
      }
    }
  }, [isChatOpen, chatMessages, roomId]);

  // Update meeting info participant count
  useEffect(() => {
    setMeetingInfo(prev => ({ ...prev, participants: participants.length + (localParticipant ? 1 : 0) }));
  }, [participants, localParticipant]);

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
        <Typography ml={2} mt={2}>Joining meeting...</Typography>
        <Typography variant="caption" color="text.secondary" mt={1}>
          Setting up your audio and video
        </Typography>
        
        {/* Emergency bypass button */}
        <Button 
          variant="outlined" 
          color="warning" 
          sx={{ mt: 3 }}
          onClick={() => {
            console.log('🚨 Emergency bypass activated');
            setIsLoading(false);
          }}
        >
          Skip Setup Process
        </Button>
        
        {/* Troubleshooting tips */}
        <Box sx={{ mt: 4, maxWidth: 500, textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Taking too long? Try these steps:
          </Typography>
          <Typography variant="body2" color="text.secondary" component="ul" sx={{ textAlign: 'left' }}>
            <li>Check that your camera and microphone are connected</li>
            <li>Allow camera/microphone permissions when prompted</li>
            <li>Try using a different browser</li>
            <li>Refresh the page and try again</li>
          </Typography>
        </Box>
      </Box>
    );
  }

  // !! Display Auth Error if present !!
  if (authError) {
     return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/login?guest=true')}
            color="secondary"
          >
            Join as Guest
          </Button>
        </Box>
      </Box>
     );
  }

  return (
    <Box sx={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {isVRMode ? (
        // Show VR Meeting View
        <MeetingView 
          participants={participants} 
          localParticipant={localParticipant}
        />
      ) : (
        // Show regular meeting UI
        <>
          {/* Meeting Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 3,
              py: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box>
              <Typography variant="h6" component="div">
                {meetingInfo.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Box component="span" sx={{ mr: 1 }}>
                  Room ID: {roomId}
                </Box>
                <IconButton
                  size="small"
                  onClick={copyMeetingLink}
                  sx={{ p: 0.5 }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {meetingInfo.duration}
              </Typography>
            </Box>
          </Box>

          {/* Main Meeting Area */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              overflow: 'hidden',
            }}
          >
            {/* Video Grid */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                display: 'flex',
                overflow: 'auto',
              }}
            >
              <Grid
                container
                spacing={2}
                sx={{
                  width: '100%',
                  height: '100%',
                }}
              >
                {/* Local Video */}
                <Grid
                  item
                  xs={12}
                  md={activeParticipants.length === 0 ? 12 : 6}
                  lg={activeParticipants.length < 2 ? 6 : 4}
                  xl={activeParticipants.length < 4 ? 4 : 3}
                  sx={{
                    height: {
                      xs: activeParticipants.length === 0 ? '100%' : '50%',
                      md: activeParticipants.length < 3 ? '100%' : '50%',
                      lg: activeParticipants.length < 6 ? '50%' : '33.33%',
                    },
                  }}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      position: 'relative',
                      height: '100%',
                      bgcolor: 'background.paper',
                      overflow: 'hidden',
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: isVideoOff
                          ? alpha(theme.palette.primary.main, 0.1)
                          : 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {!isVideoOff ? (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          muted
                          playsInline
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            fontSize: '2rem',
                            bgcolor: theme.palette.primary.main,
                          }}
                        >
                          {currentUser?.name?.charAt(0) || 'Y'}
                        </Avatar>
                      )}
                    </Box>
                    
                    {/* Participant Info */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 1,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        You {isMuted && '(Muted)'}
                      </Typography>
                      <Box>
                        {isMuted ? (
                          <MicOffIcon fontSize="small" color="error" />
                        ) : (
                          <MicIcon fontSize="small" />
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Remote Participants */}
                {activeParticipants.filter(p => p.id !== currentUser?.id).map(participant => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={participant.id} style={{ height: '50%' }}>
                    <RemoteParticipant 
                      participant={participant} 
                      stream={remoteStreams[participant.id]} 
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Chat/Participants Panel */}
            <Drawer
              anchor="right"
              variant="persistent"
              open={isChatOpen || isParticipantsOpen}
              sx={{
                width: { xs: '100%', sm: 320 },
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: { xs: '100%', sm: 320 },
                  boxSizing: 'border-box',
                  position: 'relative',
                  border: 'none',
                  borderLeft: `1px solid ${theme.palette.divider}`,
                },
              }}
            >
              {/* Chat Panel */}
              {isChatOpen && (
                <>
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="h6">Chat</Typography>
                    <IconButton onClick={toggleChat}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  
                  <Box
                    sx={{
                      p: 2,
                      height: 'calc(100vh - 230px)',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {chatMessages.length === 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          color: 'text.secondary',
                        }}
                      >
                        <ChatIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                        <Typography variant="body1">No messages yet</Typography>
                        <Typography variant="body2">
                          Be the first to send a message
                        </Typography>
                      </Box>
                    ) : (
                      chatMessages.map((message) => (
                        <Box
                          key={message.id || message.timestamp}
                          sx={{
                            mb: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: message.isLocal ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mr: 1 }}
                            >
                              {message.senderName || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(message.timestamp)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              maxWidth: '80%',
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: message.isLocal
                                ? theme.palette.primary.main
                                : theme.palette.mode === 'dark'
                                ? alpha(theme.palette.primary.main, 0.15)
                                : alpha(theme.palette.primary.main, 0.05),
                              color: message.isLocal ? 'white' : 'text.primary',
                              position: 'relative',
                            }}
                          >
                            <Typography variant="body2">
                              {/* Support for basic emoji replacement */}
                              {message.text.replace(/:smile:/g, '😊')
                               .replace(/:laugh:/g, '😂')
                               .replace(/:heart:/g, '❤️')
                               .replace(/:thumbsup:/g, '👍')}
                            </Typography>
                            
                            {/* Read receipt indicator */}
                            {message.isLocal && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  position: 'absolute',
                                  right: 4,
                                  bottom: -16,
                                  color: message.read ? 'success.main' : 'text.disabled',
                                  fontSize: '0.6rem'
                                }}
                              >
                                {message.read ? 'Read' : 'Sent'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                  
                  {/* Chat Input Form */}
                  <Box
                    component="form"
                    onSubmit={handleSendMessage}
                    sx={{
                      p: 2,
                      borderTop: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type a message... (try :smile: :heart:)"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              type="submit"
                              disabled={!newMessage.trim()}
                              color="primary"
                            >
                              <SendIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                </>
              )}

              {/* Participants Panel */}
              {isParticipantsOpen && (
                <>
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="h6">Participants ({participants.length + 1})</Typography>
                    <IconButton onClick={toggleParticipants}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                  <List
                    sx={{
                      height: 'calc(100vh - 165px)',
                      overflowY: 'auto',
                    }}
                  >
                    {/* Current User */}
                    <ListItem
                      sx={{
                        py: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {currentUser?.name?.charAt(0) || 'Y'}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography fontWeight={500}>
                              You {isMuted && '(Muted)'}
                            </Typography>
                            <Box component="span" sx={{ ml: 'auto' }}>
                              {isMuted ? (
                                <MicOffIcon fontSize="small" color="error" />
                              ) : (
                                <MicIcon fontSize="small" />
                              )}
                            </Box>
                          </Box>
                        }
                        secondary="You"
                      />
                    </ListItem>

                    {/* Remote Participants */}
                    {activeParticipants.map((participant) => (
                      <ListItem
                        key={participant.id}
                        sx={{
                          py: 1.5,
                          ...(participant.isSpeaking && {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            borderRadius: 1,
                          }),
                        }}
                      >
                        <ListItemIcon>
                          <Avatar>
                            {participant.name.charAt(0)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography fontWeight={500}>
                                {participant.name} {!participant.hasAudio && '(Muted)'}
                              </Typography>
                              <Box component="span" sx={{ ml: 'auto' }}>
                                {!participant.hasAudio ? (
                                  <MicOffIcon fontSize="small" color="error" />
                                ) : participant.isSpeaking ? (
                                  <RecordVoiceOverIcon
                                    fontSize="small"
                                    color="primary"
                                  />
                                ) : (
                                  <MicIcon fontSize="small" />
                                )}
                              </Box>
                            </Box>
                          }
                          secondary={participant.isHost ? 'Host' : 'Participant'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Drawer>
          </Box>

          {/* Meeting Controls */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: theme.palette.background.default,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Grid container spacing={1} sx={{ maxWidth: 800, mx: 'auto' }}>
              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                {/* Audio Control */}
                <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                  <IconButton
                    onClick={toggleMute}
                    sx={{
                      bgcolor: isMuted ? 'error.main' : 'action.selected',
                      color: isMuted ? 'white' : 'text.primary',
                      '&:hover': {
                        bgcolor: isMuted ? 'error.dark' : 'action.selected',
                      },
                      height: 45,
                      width: 45,
                    }}
                  >
                    {isMuted ? <MicOffIcon /> : <MicIcon />}
                  </IconButton>
                </Tooltip>

                {/* Video Control */}
                <Tooltip title={isVideoOff ? 'Turn on video' : 'Turn off video'}>
                  <IconButton
                    onClick={toggleVideo}
                    sx={{
                      bgcolor: isVideoOff ? 'error.main' : 'action.selected',
                      color: isVideoOff ? 'white' : 'text.primary',
                      '&:hover': {
                        bgcolor: isVideoOff ? 'error.dark' : 'action.selected',
                      },
                      height: 45,
                      width: 45,
                    }}
                  >
                    {isVideoOff ? <VideocamOffIcon /> : <VideocamIcon />}
                  </IconButton>
                </Tooltip>

                {/* Screen Share Control */}
                <Tooltip
                  title={
                    isScreenSharing ? 'Stop sharing screen' : 'Share screen'
                  }
                >
                  <IconButton
                    onClick={toggleScreenShare}
                    sx={{
                      bgcolor: isScreenSharing ? 'primary.main' : 'action.selected',
                      color: isScreenSharing ? 'white' : 'text.primary',
                      '&:hover': {
                        bgcolor: isScreenSharing
                          ? 'primary.dark'
                          : 'action.selected',
                      },
                      height: 45,
                      width: 45,
                    }}
                  >
                    {isScreenSharing ? (
                      <StopScreenShareIcon />
                    ) : (
                      <ScreenShareIcon />
                    )}
                  </IconButton>
                </Tooltip>

                {/* Chat Control */}
                <Tooltip title="Chat">
                  <IconButton
                    onClick={toggleChat}
                    sx={{
                      bgcolor: isChatOpen ? 'primary.main' : 'action.selected',
                      color: isChatOpen ? 'white' : 'text.primary',
                      '&:hover': {
                        bgcolor: isChatOpen ? 'primary.dark' : 'action.selected',
                      },
                      height: 45,
                      width: 45,
                    }}
                  >
                    <Badge
                      color="error"
                      variant="dot"
                      invisible={isChatOpen || chatMessages.length === 0}
                    >
                      <ChatIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Participants Control */}
                <Tooltip title="Participants">
                  <IconButton
                    onClick={toggleParticipants}
                    sx={{
                      bgcolor: isParticipantsOpen
                        ? 'primary.main'
                        : 'action.selected',
                      color: isParticipantsOpen ? 'white' : 'text.primary',
                      '&:hover': {
                        bgcolor: isParticipantsOpen
                          ? 'primary.dark'
                          : 'action.selected',
                      },
                      height: 45,
                      width: 45,
                    }}
                  >
                    <PeopleIcon />
                  </IconButton>
                </Tooltip>

                {/* Settings Control */}
                <Tooltip title="Settings">
                  <IconButton
                    sx={{
                      bgcolor: 'action.selected',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                      height: 45,
                      width: 45,
                    }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>

                {/* VR Mode Control */}
                <Tooltip title="Enter VR Mode">
                  <IconButton
                    onClick={toggleVRMode}
                    sx={{ 
                      color: 'white',
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                      mx: 1
                    }}
                  >
                    <ViewInArIcon />
                  </IconButton>
                </Tooltip>

                {/* End Call Button */}
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CallEndIcon />}
                  onClick={handleEndCall}
                  sx={{
                    height: 45,
                    borderRadius: 45 / 2,
                    px: 2,
                    ml: { xs: 0, sm: 2 },
                  }}
                >
                  End
                </Button>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
      
      {/* Add a button to exit VR mode when in VR */}
      {isVRMode && (
        <Button
          variant="contained"
          color="primary"
          onClick={toggleVRMode}
          startIcon={<CloseIcon />}
          sx={{ 
            position: 'absolute', 
            top: 20, 
            left: 20, 
            zIndex: 2000 
          }}
        >
          Exit VR Mode
        </Button>
      )}

      {/* Notification snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
      >
        <Alert onClose={closeNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeetingRoom; 