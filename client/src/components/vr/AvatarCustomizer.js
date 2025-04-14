import React, { useState } from 'react';
import {
  Box,
  Slider,
  Typography,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import useVRStore from '../../store/vrStore';

const AvatarCustomizer = ({ participantId }) => {
  const [avatarData, setAvatarData] = useState({
    color: '#4a90e2',
    size: 1,
    accessories: [],
  });
  const updateAvatar = useVRStore((state) => state.updateAvatar);

  const handleColorChange = (event) => {
    setAvatarData({ ...avatarData, color: event.target.value });
  };

  const handleSizeChange = (event, newValue) => {
    setAvatarData({ ...avatarData, size: newValue });
  };

  const handleSave = () => {
    updateAvatar(participantId, avatarData);
  };

  return (
    <Paper sx={{ p: 2, position: 'absolute', right: 20, top: 80, zIndex: 1000 }}>
      <Typography variant="h6" gutterBottom>
        Customize Your Avatar
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography gutterBottom>Color</Typography>
          <input
            type="color"
            value={avatarData.color}
            onChange={handleColorChange}
            style={{ width: '100%', height: 30 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography gutterBottom>Size</Typography>
          <Slider
            value={avatarData.size}
            onChange={handleSizeChange}
            min={0.5}
            max={2}
            step={0.1}
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={handleSave} fullWidth>
            Save Changes
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AvatarCustomizer; 