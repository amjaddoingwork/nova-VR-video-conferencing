import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Paper, Grid, Typography, Tooltip, IconButton, CircularProgress } from '@mui/material';
import { VideoCall, ViewInAr, Groups, Public, School } from '@mui/icons-material';
import VRRoom from './vr/VRRoom';
import AvatarCustomizer from './vr/AvatarCustomizer';
import useVRStore from '../store/vrStore';
import RemoteParticipant from './RemoteParticipant';

// Grid item for a participant
const ParticipantGridItem = ({ participant }) => {
  // Add missing participant fallback
  if (!participant) {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} sx={{ height: '33%' }}>
        <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography>Unknown Participant</Typography>
        </Paper>
      </Grid>
    );
  }

  // Log stream status for debugging
  const streamStatus = !participant.stream 
    ? 'No stream available' 
    : `Stream present: ${participant.stream.id} with ${participant.stream.getTracks().length} tracks`;
  
  console.log(`Rendering participant: ${participant.id} - ${participant.name}, Stream status: ${streamStatus}`);
  
  return (
    <Grid item xs={12} sm={6} md={4} lg={3} sx={{ height: '33%' }}>
      <RemoteParticipant participant={participant} stream={participant.stream} />
    </Grid>
  );
};

const MeetingView = (props) => {
  const { localParticipant, participants = [] } = props;
  const [viewMode, setViewMode] = useState('video'); // 'video' or 'vr'
  const roomType = useVRStore((state) => state.roomType);
  const setRoomType = useVRStore((state) => state.setRoomType);
  const [streamVerified, setStreamVerified] = useState(false);
  
  // Set default room type to auditorium
  useEffect(() => {
    setRoomType('auditorium');
  }, [setRoomType]);
  
  // Quick room type selection
  const roomTypes = [
    { type: 'auditorium', icon: <Public />, tooltip: 'Auditorium' },
    { type: 'boardroom', icon: <Groups />, tooltip: 'Boardroom' },
    { type: 'classroom', icon: <School />, tooltip: 'Classroom' },
    { type: 'conference', icon: <VideoCall />, tooltip: 'Conference Room' },
    { type: 'outdoor', icon: <Public />, tooltip: 'Outdoor Setting' },
    { type: 'futuristic', icon: <ViewInAr />, tooltip: 'Futuristic Space' }
  ];

  const toggleViewMode = () => {
    setViewMode(viewMode === 'video' ? 'vr' : 'video');
  };
  
  // Verify that streams are valid
  useEffect(() => {
    const checkStreams = () => {
      let valid = true;
      
      // Check local participant stream
      if (localParticipant && localParticipant.stream) {
        const tracks = localParticipant.stream.getTracks();
        console.log(`Local participant stream check: ${tracks.length} tracks`);
        valid = valid && tracks.length > 0;
      }
      
      // Check remote participant streams
      participants.forEach(participant => {
        if (participant && participant.stream) {
          const tracks = participant.stream.getTracks();
          console.log(`Remote participant ${participant.id} stream check: ${tracks.length} tracks`);
          valid = valid && tracks.length > 0;
        }
      });
      
      setStreamVerified(valid);
    };
    
    checkStreams();
    // Check periodically to detect changes
    const intervalId = setInterval(checkStreams, 5000);
    
    return () => clearInterval(intervalId);
  }, [localParticipant, participants]);
  
  // Helper function to check if any screen sharing is active
  const getScreenShareInfo = useCallback(() => {
    // Check if local participant is screen sharing
    if (localParticipant && localParticipant.isScreenSharing && localParticipant.screenStream) {
      return { active: true, stream: localParticipant.screenStream };
    }
    
    // Check remote participants
    for (const p of participants) {
      if (p && p.isScreenSharing && p.screenStream) {
        return { active: true, stream: p.screenStream };
      }
    }
    
    // No screen share stream found
    return { active: false, stream: null };
  }, [localParticipant, participants]);

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {/* View mode toggle button - only shown in video mode */}
      {viewMode === 'video' && (
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 100 }}>
          <Tooltip title="Switch to VR Mode">
            <Button 
              variant="contained" 
              color="primary" 
              onClick={toggleViewMode}
              startIcon={<ViewInAr />}
            >
              Enter VR
            </Button>
          </Tooltip>
        </Box>
      )}
      
      {/* Quick room selector - only shown in video mode */}
      {viewMode === 'video' && (
        <Box sx={{ 
          position: 'absolute', 
          top: 16,
          left: 16, 
          zIndex: 100, 
          display: 'flex', 
          gap: 1,
          flexWrap: 'wrap',
          maxWidth: '250px'
        }}>
          {roomTypes.map(({ type, icon, tooltip }) => (
            <Tooltip key={type} title={tooltip}>
              <IconButton 
                color={roomType === type ? 'primary' : 'default'}
                onClick={() => setRoomType(type)}
                sx={{ 
                  bgcolor: roomType === type ? 'primary.light' : 'background.paper',
                  '&:hover': { bgcolor: roomType === type ? 'primary.main' : 'action.hover' }
                }}
              >
                {icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      )}

      {viewMode === 'video' ? (
        // Video Mode
        <Box sx={{ height: '100%', overflow: 'hidden' }}>
          <Grid container spacing={1} sx={{ height: '100%', p: 1 }}>
            {/* Local participant video */}
            {localParticipant && (
              <ParticipantGridItem participant={localParticipant} />
            )}
            
            {/* Remote participants */}
            {participants.map(participant => (
              <ParticipantGridItem 
                key={participant.id} 
                participant={participant} 
              />
            ))}
            
            {/* Show message when no participants */}
            {participants.length === 0 && !localParticipant && (
              <Grid item xs={12}>
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  p: 4
                }}>
                  <Typography variant="h5" gutterBottom>You're the only one here</Typography>
                  <Typography variant="body1">Share the meeting link to invite others</Typography>
                </Box>
              </Grid>
            )}
            
            {/* Stream verification indicator */}
            {!streamVerified && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  bgcolor: 'background.paper', 
                  borderRadius: 1, 
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <CircularProgress size={16} />
                <Typography variant="caption">Verifying video streams...</Typography>
              </Box>
            )}
          </Grid>
        </Box>
      ) : (
        // VR Mode - removed RoomSelector and simplified UI
        <>
          <VRRoom 
            participants={participants.filter(Boolean)} 
            localParticipant={localParticipant}
            roomType={roomType}
            roomData={{
              roomTemplate: roomType,
              // Pass any screen sharing data to VR room
              screenShare: getScreenShareInfo()
            }}
          />
          {/* Exit VR button positioned at the bottom instead of top right */}
          <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 100 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={toggleViewMode}
              startIcon={<VideoCall />}
            >
              Exit VR
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default MeetingView; 