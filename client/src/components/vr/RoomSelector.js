import React from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import useVRStore from '../../store/vrStore';

const roomTypes = [
  {
    id: 'auditorium',
    name: 'Auditorium',
    description: 'Large space for presentations and lectures',
  },
  {
    id: 'boardroom',
    name: 'Boardroom',
    description: 'Professional meeting space for team discussions',
  },
  {
    id: 'classroom',
    name: 'Classroom',
    description: 'Educational environment for learning sessions',
  },
];

const RoomSelector = () => {
  const setRoomType = useVRStore((state) => state.setRoomType);
  const currentRoomType = useVRStore((state) => state.roomType);

  return (
    <Paper sx={{ p: 2, position: 'absolute', left: 20, top: 80, zIndex: 1000, maxWidth: 250 }}>
      <Typography variant="h6" gutterBottom>
        Select Room Type
      </Typography>
      <Grid container spacing={2}>
        {roomTypes.map((room) => (
          <Grid item xs={12} key={room.id}>
            <Button
              variant={currentRoomType === room.id ? 'contained' : 'outlined'}
              fullWidth
              onClick={() => setRoomType(room.id)}
              sx={{ justifyContent: 'flex-start', textAlign: 'left', display: 'block' }}
            >
              <Box>
                <Typography variant="subtitle1">{room.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {room.description}
                </Typography>
              </Box>
            </Button>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default RoomSelector; 