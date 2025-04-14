import create from 'zustand';

const useVRStore = create((set, get) => ({
  // Local participant (user)
  localParticipant: {
    id: 'local-user',
    displayName: 'You',
    isVideoOff: true,
    isMuted: false,
    isScreenSharing: false,
    avatarColor: '#4FC3F7',
    avatarScale: 1,
    avatarStyle: 'robot',
    emote: null,
    stream: null,
    screenStream: null
  },
  
  // Remote participants
  remoteParticipants: [],
  
  // Avatar positions for movement tracking
  avatarPositions: {},
  
  // Current room information
  currentRoom: null,
  
  // Update local participant data
  updateLocalParticipant: (data) => {
    set((state) => ({
      localParticipant: {
        ...state.localParticipant,
        ...data
      }
    }));
  },
  
  // Update avatar emote
  updateAvatarEmote: (participantId, emote) => {
    set((state) => {
      // If it's the local participant
      if (participantId === state.localParticipant.id) {
        return {
          localParticipant: {
            ...state.localParticipant,
            emote
          }
        };
      }
      
      // If it's a remote participant
      return {
        remoteParticipants: state.remoteParticipants.map(p => 
          p.id === participantId 
            ? { ...p, emote } 
            : p
        )
      };
    });
    
    // Reset emote after a delay
    setTimeout(() => {
      set((state) => {
        // For local participant
        if (participantId === state.localParticipant.id && 
            state.localParticipant.emote === emote) {
          return {
            localParticipant: {
              ...state.localParticipant,
              emote: null
            }
          };
        }
        
        // For remote participants
        if (state.remoteParticipants.some(p => p.id === participantId && p.emote === emote)) {
          return {
            remoteParticipants: state.remoteParticipants.map(p => 
              p.id === participantId && p.emote === emote
                ? { ...p, emote: null } 
                : p
            )
          };
        }
        
        return {};
      });
    }, 3000); // Reset emote after 3 seconds
  },
  
  // Track avatar position
  updateAvatarPosition: (x, y, z) => {
    const id = get().localParticipant.id;
    set((state) => ({
      avatarPositions: {
        ...state.avatarPositions,
        [id]: [x, y, z]
      }
    }));
  },
  
  // Add remote participant
  addRemoteParticipant: (participant) => {
    set((state) => {
      // Check if participant already exists
      if (state.remoteParticipants.some(p => p.id === participant.id)) {
        // Update existing participant
        return {
          remoteParticipants: state.remoteParticipants.map(p => 
            p.id === participant.id 
              ? { ...p, ...participant } 
              : p
          )
        };
      }
      
      // Add new participant with default avatar settings
      return {
        remoteParticipants: [
          ...state.remoteParticipants, 
          {
            ...participant,
            isVideoOff: participant.isVideoOff ?? true,
            isMuted: participant.isMuted ?? false,
            isScreenSharing: participant.isScreenSharing ?? false,
            avatarColor: participant.avatarColor || getRandomColor(),
            avatarScale: participant.avatarScale || 1,
            avatarStyle: participant.avatarStyle || 'robot',
            emote: null
          }
        ]
      };
    });
  },
  
  // Remove remote participant
  removeRemoteParticipant: (participantId) => {
    set((state) => ({
      remoteParticipants: state.remoteParticipants.filter(p => p.id !== participantId)
    }));
  },
  
  // Update remote participant data
  updateRemoteParticipant: (participantId, data) => {
    set((state) => ({
      remoteParticipants: state.remoteParticipants.map(p => 
        p.id === participantId 
          ? { ...p, ...data } 
          : p
      )
    }));
  },
  
  // Set current room
  setCurrentRoom: (roomData) => {
    set({ currentRoom: roomData });
  },
  
  // Participants data
  participants: [],
  
  // VR room settings
  roomType: 'conference', // 'conference', 'outdoor', 'futuristic', 'classroom'
  
  // Avatar customization data
  avatars: {},
  
  // Presentation data
  presentation: {
    isActive: false,
    currentSlide: 0,
    totalSlides: 0,
    mediaUrl: null,
    screenShareStreamId: null
  },
  
  // Persistent whiteboard data
  whiteboard: {
    lines: [],
    notes: []
  },
  
  // Methods for participants
  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant]
    })),
    
  removeParticipant: (participantId) =>
    set((state) => ({
      participants: state.participants.filter(p => p.id !== participantId)
    })),
    
  // Methods for avatar customization
  updateAvatar: (participantId, avatarData) =>
    set((state) => ({
      avatars: {
        ...state.avatars,
        [participantId]: avatarData
      }
    })),
    
  updateAvatarScale: (participantId, scale) =>
    set((state) => ({
      avatars: {
        ...state.avatars,
        [participantId]: {
          ...(state.avatars[participantId] || {}),
          scale
        }
      }
    })),
    
  updateAvatarGesture: (participantId, gesture) =>
    set((state) => ({
      avatars: {
        ...state.avatars,
        [participantId]: {
          ...(state.avatars[participantId] || {}),
          gesture
        }
      }
    })),
    
  // Methods for room settings
  setRoomType: (roomType) => set({ roomType }),
  
  // Methods for presentation control
  startPresentation: (totalSlides, mediaUrl) =>
    set({
      presentation: {
        isActive: true,
        currentSlide: 0,
        totalSlides,
        mediaUrl,
        screenShareStreamId: null
      }
    }),
    
  setScreenShare: (streamId) =>
    set((state) => ({
      presentation: {
        ...state.presentation,
        isActive: true,
        screenShareStreamId: streamId
      }
    })),
    
  endPresentation: () =>
    set({
      presentation: {
        isActive: false,
        currentSlide: 0,
        totalSlides: 0,
        mediaUrl: null,
        screenShareStreamId: null
      }
    }),
    
  nextSlide: () =>
    set((state) => {
      if (!state.presentation.isActive) return state;
      const currentSlide = Math.min(state.presentation.currentSlide + 1, state.presentation.totalSlides - 1);
      return {
        presentation: {
          ...state.presentation,
          currentSlide
        }
      };
    }),
    
  prevSlide: () =>
    set((state) => {
      if (!state.presentation.isActive) return state;
      const currentSlide = Math.max(state.presentation.currentSlide - 1, 0);
      return {
        presentation: {
          ...state.presentation,
          currentSlide
        }
      };
    }),
    
  // Methods for whiteboard
  addWhiteboardLine: (line) =>
    set((state) => ({
      whiteboard: {
        ...state.whiteboard,
        lines: [...state.whiteboard.lines, line]
      }
    })),
    
  addWhiteboardNote: (note) =>
    set((state) => ({
      whiteboard: {
        ...state.whiteboard,
        notes: [...state.whiteboard.notes, note]
      }
    })),
    
  clearWhiteboard: () =>
    set({
      whiteboard: {
        lines: [],
        notes: []
      }
    }),
  
  // Method to broadcast messages to all participants (for polls, etc.)
  broadcastMessage: (message) => {
    // In a real implementation, this would send the message to all participants
    // via WebRTC data channels or signaling server
    console.log('Broadcasting message:', message);
    
    // For now, we'll just handle the message locally
    if (message.type === 'poll_started') {
      // In a real app, this would be received by other participants
      console.log('Poll started:', message.poll);
    } else if (message.type === 'poll_vote') {
      // In a real app, this would update the poll results for all participants
      console.log('Poll vote received:', message.optionIndex);
    }
    
    // If we had a connection object, we would send the message like this:
    // connection.send(JSON.stringify(message));
  }
}));

// Helper for random avatar colors
const getRandomColor = () => {
  const colors = [
    '#FF8A65', // coral
    '#FFD54F', // amber
    '#81C784', // green
    '#4FC3F7', // light blue
    '#9575CD', // purple
    '#F06292', // pink
    '#A1887F', // brown
    '#90A4AE'  // blue grey
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default useVRStore; 