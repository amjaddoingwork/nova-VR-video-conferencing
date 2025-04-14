import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Mic, MicOff } from '@mui/icons-material';

const ParticipantContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#f5f5f5',
  borderRadius: '8px',
  overflow: 'hidden',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const VideoElement = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const InfoOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const RemoteParticipant = ({ participant, stream }) => {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Helper to handle video display
  const setupVideoStream = () => {
    if (!videoRef.current || !stream) return false;
    
    try {
      console.log(`Setting stream for participant ${participant.id}`, {
        streamId: stream.id,
        hasTracks: stream.getTracks().length > 0,
        hasVideoTracks: stream.getVideoTracks().length > 0,
        hasAudioTracks: stream.getAudioTracks().length > 0,
      });
      
      // Reset error state when trying to set up video
      setVideoError(false);
      
      // Assign the stream to the video element
      videoRef.current.srcObject = stream;
      
      return true;
    } catch (err) {
      console.error(`Error setting up video for participant ${participant.id}:`, err);
      setVideoError(true);
      return false;
    }
  };
  
  // Handle stream changes
  useEffect(() => {
    setLoading(true);
    
    // Only proceed if we have both a video element and a stream
    if (videoRef.current && stream) {
      const streamSetup = setupVideoStream();
      
      if (!streamSetup) {
        console.warn(`Failed to set up stream for participant ${participant.id}`);
        setVideoError(true);
        setLoading(false);
        return;
      }
      
      // Ensure video plays when ready
      const playVideo = async () => {
        try {
          setLoading(true);
          console.log(`Attempting to play video for participant ${participant.id}`);
          await videoRef.current.play();
          setVideoReady(true);
          setLoading(false);
        } catch (err) {
          console.warn(`Auto-play failed for participant ${participant.id}:`, err);
          setVideoError(true);
          setLoading(false);
          
          // Try again with muted setting if autoplay was blocked
          if (err.name === 'NotAllowedError') {
            try {
              console.log('Trying to play muted after autoplay failure');
              videoRef.current.muted = true;
              await videoRef.current.play();
              setVideoReady(true);
            } catch (mutedErr) {
              console.error('Still failed to play even when muted:', mutedErr);
            }
          }
        }
      };
      
      // Set up event listeners
      const handleCanPlay = () => {
        console.log(`Video can play for participant ${participant.id}`);
        setVideoReady(true);
        setLoading(false);
      };
      
      const handleError = (err) => {
        console.error(`Video error for participant ${participant.id}:`, err);
        setVideoError(true);
        setLoading(false);
      };
      
      videoRef.current.addEventListener('loadedmetadata', playVideo);
      videoRef.current.addEventListener('canplay', handleCanPlay);
      videoRef.current.addEventListener('error', handleError);
      
      // Cleanup function
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', playVideo);
          videoRef.current.removeEventListener('canplay', handleCanPlay);
          videoRef.current.removeEventListener('error', handleError);
        }
      };
    } else if (!stream) {
      console.log(`No stream available for participant ${participant.id}`);
      setLoading(false);
    }
  }, [stream, participant.id]);
  
  // Check if stream has audio tracks that are enabled
  const hasAudio = stream && stream.getAudioTracks().some(track => track.enabled);
  
  // Check if stream has video tracks that are enabled
  const hasVideo = stream && stream.getVideoTracks().some(track => track.enabled);
  
  // Also check participant's explicit state (in case stream exists but UI should show as off)
  const showVideo = hasVideo && !participant.isVideoOff && !videoError;
  const showAudio = hasAudio && !participant.isMuted;
  
  // Reset video if there's an error
  const handleRetry = () => {
    if (videoError && stream) {
      setVideoError(false);
      setLoading(true);
      setupVideoStream();
    }
  };
  
  return (
    <ParticipantContainer elevation={3}>
      {showVideo ? (
        <>
          <VideoElement 
            ref={videoRef}
            autoPlay
            playsInline
            muted={participant.isLocal}
          />
          {loading && (
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)'
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
        </>
      ) : (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          height="100%"
          onClick={videoError ? handleRetry : undefined}
          sx={{ cursor: videoError ? 'pointer' : 'default' }}
        >
          <Avatar
            sx={{ width: 80, height: 80, fontSize: 40, bgcolor: 'primary.main' }}
          >
            {participant.name ? participant.name.charAt(0).toUpperCase() : '?'}
          </Avatar>
          <Typography variant="subtitle1" mt={2}>
            {participant.name || 'Unknown Participant'}
          </Typography>
          {videoError && (
            <Typography variant="caption" color="error" mt={1}>
              Video failed. Click to retry.
            </Typography>
          )}
        </Box>
      )}
      
      <InfoOverlay>
        <Typography variant="body2">
          {participant.name || 'Unknown Participant'}
          {participant.isGuest && ' (Guest)'}
        </Typography>
        {showAudio ? <Mic fontSize="small" /> : <MicOff fontSize="small" />}
      </InfoOverlay>
    </ParticipantContainer>
  );
};

export default RemoteParticipant; 