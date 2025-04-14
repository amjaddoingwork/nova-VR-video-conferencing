import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  Radio, 
  FormControlLabel, 
  Typography,
  Select,
  MenuItem,
  Slider,
  IconButton,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import useVRStore from '../../store/vrStore';

const VRSettings = ({ participantId }) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  
  // Get and set VR store state
  const roomType = useVRStore((state) => state.roomType);
  const setRoomType = useVRStore((state) => state.setRoomType);
  const updateAvatar = useVRStore((state) => state.updateAvatar);
  const avatars = useVRStore((state) => state.avatars);
  const updateAvatarScale = useVRStore((state) => state.updateAvatarScale);
  
  // Get current avatar data or default
  const avatarData = avatars[participantId] || {};
  const [avatarModel, setAvatarModel] = useState(avatarData.model || 'dragon');
  const [avatarColor, setAvatarColor] = useState(avatarData.color || '#4a90e2');
  const [avatarScale, setAvatarScale] = useState(avatarData.scale || 0.15);
  
  // Save settings to store
  const saveSettings = () => {
    updateAvatar(participantId, {
      ...avatarData,
      id: participantId,
      model: avatarModel,
      color: avatarColor
    });
    updateAvatarScale(participantId, avatarScale);
  };
  
  // Update local state when store changes
  useEffect(() => {
    setAvatarModel(avatarData.model || 'dragon');
    setAvatarColor(avatarData.color || '#4a90e2');
    setAvatarScale(avatarData.scale || 0.15);
  }, [avatarData]);
  
  // Save settings when component unmounts
  useEffect(() => {
    return () => {
      saveSettings();
    };
  }, [avatarModel, avatarColor, avatarScale]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h6" sx={{ p: 2, bgcolor: '#1976d2', color: 'white' }}>
        VR Settings
      </Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
        <Tab label="Room" />
        <Tab label="Avatar" />
        <Tab label="Controls" />
      </Tabs>
      
      <Box sx={{ p: 2 }}>
        {/* Room Settings */}
        {activeTab === 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Select Environment
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <RadioGroup
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Box 
                    sx={{ 
                      border: roomType === 'conference' ? '2px solid #2196f3' : '1px solid #ddd', 
                      p: 1, 
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setRoomType('conference')}
                  >
                    <FormControlLabel
                      value="conference"
                      control={<Radio />}
                      label="Conference Room"
                    />
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      Professional setting for meetings
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      border: roomType === 'classroom' ? '2px solid #2196f3' : '1px solid #ddd', 
                      p: 1, 
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setRoomType('classroom')}
                  >
                    <FormControlLabel
                      value="classroom"
                      control={<Radio />}
                      label="Classroom"
                    />
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      Educational environment
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      border: roomType === 'outdoor' ? '2px solid #2196f3' : '1px solid #ddd', 
                      p: 1, 
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setRoomType('outdoor')}
                  >
                    <FormControlLabel
                      value="outdoor"
                      control={<Radio />}
                      label="Outdoor Setting"
                    />
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      Natural environment for relaxed discussions
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      border: roomType === 'futuristic' ? '2px solid #2196f3' : '1px solid #ddd', 
                      p: 1, 
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setRoomType('futuristic')}
                  >
                    <FormControlLabel
                      value="futuristic"
                      control={<Radio />}
                      label="Futuristic Space"
                    />
                    <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                      High-tech environment for innovation
                    </Typography>
                  </Box>
                </Box>
              </RadioGroup>
            </FormControl>
          </Box>
        )}
        
        {/* Avatar Settings */}
        {activeTab === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Customize Your Avatar
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Avatar Model</FormLabel>
              <Select
                value={avatarModel}
                onChange={(e) => setAvatarModel(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="dragon">Dragon</MenuItem>
                <MenuItem value="wolf">Wolf</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Avatar Color</FormLabel>
              <Box sx={{ display: 'flex', mt: 1, flexWrap: 'wrap', gap: 1 }}>
                {['#4a90e2', '#50e3c2', '#e6c700', '#ff7e79', '#b37feb', '#78909c'].map(color => (
                  <Box 
                    key={color}
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: color, 
                      borderRadius: '50%', 
                      cursor: 'pointer',
                      border: avatarColor === color ? '3px solid #000' : '1px solid #ccc'
                    }}
                    onClick={() => setAvatarColor(color)}
                  />
                ))}
              </Box>
            </FormControl>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <FormLabel>Avatar Size</FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <IconButton 
                  onClick={() => setAvatarScale(Math.max(0.05, avatarScale - 0.05))}
                  size="small"
                >
                  <Typography>-</Typography>
                </IconButton>
                
                <Slider
                  value={avatarScale}
                  onChange={(e, newValue) => setAvatarScale(newValue)}
                  min={0.05}
                  max={0.5}
                  step={0.01}
                  sx={{ mx: 2 }}
                />
                
                <IconButton 
                  onClick={() => setAvatarScale(Math.min(0.5, avatarScale + 0.05))}
                  size="small"
                >
                  <Typography>+</Typography>
                </IconButton>
              </Box>
              <Typography variant="caption" align="center">
                {avatarScale.toFixed(2)}
              </Typography>
            </FormControl>
          </Box>
        )}
        
        {/* Control Settings */}
        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Gesture Controls
            </Typography>
            
            <Typography variant="body2" gutterBottom>
              In VR mode, you can use the following gestures:
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>👋 Wave</Typography>
              <Typography variant="caption" gutterBottom display="block">
                Greet others with a friendly wave
              </Typography>
              
              <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>👍 Thumbs Up</Typography>
              <Typography variant="caption" gutterBottom display="block">
                Show approval or agreement
              </Typography>
              
              <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>👏 Clap</Typography>
              <Typography variant="caption" gutterBottom display="block">
                Applaud or show appreciation
              </Typography>
              
              <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>✋ Raise Hand</Typography>
              <Typography variant="caption" gutterBottom display="block">
                Indicate you have a question
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Navigation Tips
            </Typography>
            
            <Typography variant="body2" gutterBottom>
              • Press trigger button to select objects<br />
              • Use controller thumbstick to teleport<br />
              • Grab objects by holding grip button<br />
              • Access gesture menu with Y/B button
            </Typography>
          </Box>
        )}
        
        <Button
          variant="contained"
          color="primary"
          onClick={saveSettings}
          fullWidth
          sx={{ mt: 2 }}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default VRSettings; 