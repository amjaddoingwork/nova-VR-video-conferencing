import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography, 
  Box,
  CircularProgress
} from '@mui/material';
import { generateGuestToken, storeGuestToken } from '../utils/temporaryAuth';

const GuestLoginModal = ({ open, onClose, onSuccess }) => {
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGuestJoin = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Validate name (optional)
      const name = guestName.trim() || `Guest-${Math.random().toString(36).substring(2, 6)}`;
      
      // Generate and store token
      const { token, guestData } = generateGuestToken(name);
      storeGuestToken(token);
      
      // Simulate network delay (remove in production)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the success handler with guest data
      onSuccess(guestData);
      onClose();
    } catch (err) {
      console.error('Guest login error:', err);
      setError('Failed to create guest session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={!isLoading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>Join as Guest</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" gutterBottom>
            Enter your name to join the meeting as a guest. No account required.
          </Typography>
          
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1, mb: 2 }}>
              {error}
            </Typography>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Your Name (optional)"
            placeholder="Guest"
            fullWidth
            variant="outlined"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            disabled={isLoading}
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleGuestJoin} 
          variant="contained" 
          color="primary"
          disabled={isLoading}
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          {isLoading ? 'Joining...' : 'Join as Guest'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuestLoginModal; 