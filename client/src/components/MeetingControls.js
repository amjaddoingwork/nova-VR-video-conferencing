import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  IconButton, 
  Tooltip, 
  Modal
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  VideocamOutlined,
  VideocamOffOutlined,
  MicOutlined,
  MicOffOutlined,
  ScreenShareOutlined,
  StopScreenShareOutlined,
  CallEndOutlined,
  ChatBubbleOutlineOutlined,
  PresentToAllOutlined,
  ViewInArOutlined,
  SettingsOutlined
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import VRSettings from './vr/VRSettings';

const MeetingControls = ({
  isAudioMuted,
  isVideoOff,
  toggleAudio,
  toggleVideo,
  shareScreen,
  isScreenSharing,
  stopScreenShare,
  openChat,
  leaveRoom,
  toggleVRMode,
  isVRMode,
  toggleWhiteboard,
  isWhiteboardOpen,
  user
}) => {
  const [vrSettingsOpen, setVrSettingsOpen] = useState(false);
  
  // Add function to toggle VR settings modal
  const toggleVRSettings = () => {
    setVrSettingsOpen(!vrSettingsOpen);
  };
  
  return (
    <Box sx={{ 
      // ... existing styles ...
    }}>
      <Grid container spacing={1} justifyContent="center" alignItems="center">
        {/* ... existing controls ... */}
        
        {/* VR Mode Button */}
        <Grid item>
          <Tooltip title={isVRMode ? "Exit VR Mode" : "Enter VR Mode"}>
            <IconButton
              onClick={toggleVRMode}
              color={isVRMode ? "secondary" : "primary"}
              sx={{
                backgroundColor: isVRMode ? alpha('#f44336', 0.1) : alpha('#2196f3', 0.1),
              }}
            >
              <ViewInArOutlined />
            </IconButton>
          </Tooltip>
        </Grid>
        
        {/* VR Settings Button */}
        <Grid item>
          <Tooltip title="VR Settings">
            <IconButton
              onClick={toggleVRSettings}
              color="primary"
              sx={{
                backgroundColor: vrSettingsOpen ? alpha('#2196f3', 0.2) : alpha('#2196f3', 0.1),
              }}
              disabled={!isVRMode}
            >
              <SettingsOutlined />
            </IconButton>
          </Tooltip>
        </Grid>
        
        {/* ... remaining controls ... */}
      </Grid>
      
      {/* VR Settings Modal */}
      <Modal
        open={vrSettingsOpen}
        onClose={() => setVrSettingsOpen(false)}
        aria-labelledby="vr-settings-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 0,
        }}>
          <VRSettings participantId={user?.id} />
        </Box>
      </Modal>
    </Box>
  );
};

export default MeetingControls; 