import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  Typography,
  Box,
  IconButton,
  Divider,
  Chip,
  Autocomplete,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  Tune as TuneIcon,
  Add as AddIcon,
  VideoCall as VideoCallIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const CreateMeetingDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    startDateTime: '',
    duration: 30,
    isScheduled: false,
    requiresPassword: false,
    password: '',
    participants: [],
    waitingRoom: true,
    hostVideo: true,
    participantVideo: true,
    muteOnEntry: true,
    allowRecording: true,
    restrictToOrganization: false,
    organizationDomain: '',
  });

  const toggleAdvancedOptions = () => {
    setAdvancedOptions(!advancedOptions);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormState({
      ...formState,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const handleParticipantsChange = (_, newValue) => {
    setFormState({
      ...formState,
      participants: newValue,
    });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formState.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (formState.isScheduled && !formState.startDateTime) {
      errors.startDateTime = 'Start time is required for scheduled meetings';
    }
    
    if (formState.requiresPassword && !formState.password.trim()) {
      errors.password = 'Password is required';
    }
    
    return errors;
  };

  const handleCreateMeeting = async () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setLoading(true);
      
      // Create meeting via API
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formState.title,
          description: formState.description,
          isScheduled: formState.isScheduled,
          startDateTime: formState.startDateTime,
          duration: formState.duration,
          restrictToOrganization: formState.restrictToOrganization,
          organizationDomain: formState.restrictToOrganization ? formState.organizationDomain : '',
          settings: {
            waitingRoom: formState.waitingRoom,
            hostVideo: formState.hostVideo,
            participantVideo: formState.participantVideo,
            muteOnEntry: formState.muteOnEntry,
            allowRecording: formState.allowRecording,
            requiresPassword: formState.requiresPassword,
            password: formState.requiresPassword ? formState.password : null
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create meeting');
      }
      
      const data = await response.json();
      console.log('Meeting created successfully:', data);
      
      // Show meeting details to the user
      const meetingCreatedMessage = `
        Meeting created successfully!
        Meeting ID: ${data.meetingId}
        ${data.passcode ? `Passcode: ${data.passcode}` : ''}
      `;
      
      alert(meetingCreatedMessage);
      
      onClose();
      
      // Navigate to the meeting room
      if (!formState.isScheduled) {
        navigate(`/room/${data._id}`);
      }
      
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInstantMeeting = async () => {
    try {
      setLoading(true);
      
      // Create instant meeting via API
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: 'Instant Meeting',
          description: 'Instant meeting created on ' + new Date().toLocaleString(),
          isScheduled: false,
          settings: {
            waitingRoom: false,
            hostVideo: true,
            participantVideo: true,
            muteOnEntry: true,
            allowRecording: true
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create instant meeting');
      }
      
      const data = await response.json();
      console.log('Instant meeting created successfully:', data);
      
      // Show meeting details to the user
      const meetingCreatedMessage = `
        Meeting created successfully!
        Meeting ID: ${data.meetingId}
        ${data.passcode ? `Passcode: ${data.passcode}` : ''}
      `;
      
      alert(meetingCreatedMessage);
      
      onClose();
      navigate(`/room/${data._id}`);
      
    } catch (error) {
      console.error('Error starting instant meeting:', error);
      alert('Failed to start instant meeting: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for participants
  const contacts = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', avatar: '' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', avatar: '' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', avatar: '' },
    { id: 4, name: 'Dana White', email: 'dana@example.com', avatar: '' },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box display="flex" alignItems="center">
          <VideoCallIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" fontWeight={600}>
            Create Meeting
          </Typography>
        </Box>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider />
      
      <DialogContent>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<VideoCallIcon />}
            onClick={handleStartInstantMeeting}
            disabled={loading}
            sx={{ 
              mr: 2,
              borderRadius: 2,
              py: 1.2,
              px: 3,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Instant Meeting'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => setFormState({ ...formState, isScheduled: true })}
            sx={{ 
              borderRadius: 2,
              py: 1.2,
              px: 3,
            }}
          >
            Schedule for Later
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }}>
          <Chip 
            label="OR FILL DETAILS BELOW" 
            size="small" 
            sx={{ 
              fontSize: '0.7rem', 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600,
            }} 
          />
        </Divider>
        
        <Stack spacing={3}>
          <TextField
            label="Meeting Title"
            name="title"
            fullWidth
            variant="outlined"
            value={formState.title}
            onChange={handleInputChange}
            error={!!formErrors.title}
            helperText={formErrors.title}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
          
          <TextField
            label="Description (Optional)"
            name="description"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={formState.description}
            onChange={handleInputChange}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
          
          <FormControl fullWidth>
            <FormControlLabel
              control={
                <Switch
                  checked={formState.isScheduled}
                  onChange={handleInputChange}
                  name="isScheduled"
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <CalendarIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography>Schedule for later</Typography>
                </Box>
              }
            />
          </FormControl>
          
          {formState.isScheduled && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Start Date & Time"
                name="startDateTime"
                type="datetime-local"
                fullWidth
                variant="outlined"
                value={formState.startDateTime}
                onChange={handleInputChange}
                error={!!formErrors.startDateTime}
                helperText={formErrors.startDateTime}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
              
              <FormControl fullWidth variant="outlined">
                <InputLabel id="duration-label">Duration</InputLabel>
                <Select
                  labelId="duration-label"
                  name="duration"
                  value={formState.duration}
                  onChange={handleInputChange}
                  label="Duration"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                  <MenuItem value={45}>45 minutes</MenuItem>
                  <MenuItem value={60}>1 hour</MenuItem>
                  <MenuItem value={90}>1.5 hours</MenuItem>
                  <MenuItem value={120}>2 hours</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
          
          <Autocomplete
            multiple
            options={contacts}
            getOptionLabel={(option) => option.name}
            filterSelectedOptions
            value={formState.participants}
            onChange={handleParticipantsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Participants (Optional)"
                placeholder="Add participants"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  sx: { borderRadius: 2 }
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box display="flex" alignItems="center">
                  <Typography>{option.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({option.email})
                  </Typography>
                </Box>
              </li>
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  size="small"
                  {...getTagProps({ index })}
                  sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              ))
            }
          />
          
          <Box>
            <Button
              startIcon={<TuneIcon />}
              onClick={toggleAdvancedOptions}
              sx={{ textTransform: 'none' }}
            >
              {advancedOptions ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </Box>
          
          {advancedOptions && (
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.requiresPassword}
                        onChange={handleInputChange}
                        name="requiresPassword"
                        color="primary"
                      />
                    }
                    label="Require Meeting Password"
                  />
                </FormControl>
                
                {formState.requiresPassword && (
                  <TextField
                    label="Meeting Password"
                    name="password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    value={formState.password}
                    onChange={handleInputChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                )}
                
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.waitingRoom}
                        onChange={handleInputChange}
                        name="waitingRoom"
                        color="primary"
                      />
                    }
                    label="Enable Waiting Room"
                  />
                </FormControl>
                
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.hostVideo}
                        onChange={handleInputChange}
                        name="hostVideo"
                        color="primary"
                      />
                    }
                    label="Start Host Video"
                  />
                </FormControl>
                
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.participantVideo}
                        onChange={handleInputChange}
                        name="participantVideo"
                        color="primary"
                      />
                    }
                    label="Start Participant Video"
                  />
                </FormControl>
                
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.muteOnEntry}
                        onChange={handleInputChange}
                        name="muteOnEntry"
                        color="primary"
                      />
                    }
                    label="Mute Participants on Entry"
                  />
                </FormControl>
                
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.allowRecording}
                        onChange={handleInputChange}
                        name="allowRecording"
                        color="primary"
                      />
                    }
                    label="Allow Recording"
                  />
                </FormControl>
                
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formState.restrictToOrganization}
                        onChange={handleInputChange}
                        name="restrictToOrganization"
                        color="primary"
                      />
                    }
                    label="Restrict to Organization"
                  />
                </FormControl>
                
                {formState.restrictToOrganization && (
                  <TextField
                    label="Organization Domain"
                    name="organizationDomain"
                    placeholder="e.g. company.com"
                    fullWidth
                    variant="outlined"
                    value={formState.organizationDomain}
                    onChange={handleInputChange}
                    helperText="Only users with email addresses from this domain can join"
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleCreateMeeting} 
          variant="contained" 
          startIcon={formState.isScheduled ? <CalendarIcon /> : <VideoCallIcon />}
          disabled={loading}
          sx={{
            borderRadius: 8,
            px: 3,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : formState.isScheduled ? 'Schedule Meeting' : 'Create Meeting'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateMeetingDialog; 