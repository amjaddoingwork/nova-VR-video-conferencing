import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Link as LinkIcon,
  AccessTime as AccessTimeIcon,
  VideoCall as VideoCallIcon,
  Search as SearchIcon,
  Today as TodayIcon,
  History as HistoryIcon,
  Bookmark as BookmarkIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarTodayIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  PeopleOutline as PeopleOutlineIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import CreateMeetingDialog from '../components/CreateMeetingDialog';

// Mock data for the dashboard
const mockUpcomingMeetings = [
  {
    id: 1,
    title: 'Product Team Weekly Sync',
    date: '2023-04-15T10:00:00',
    duration: 60,
    participants: 8,
    isRecurring: true,
    roomId: 'abc-def-123',
  },
  {
    id: 2,
    title: 'Client Project Review',
    date: '2023-04-15T14:30:00',
    duration: 45,
    participants: 5,
    isRecurring: false,
    roomId: 'xyz-789-456',
  },
  {
    id: 3,
    title: 'Marketing Strategy Discussion',
    date: '2023-04-16T09:15:00',
    duration: 90,
    participants: 12,
    isRecurring: false,
    roomId: 'mno-pqr-789',
  },
];

const mockRecentMeetings = [
  {
    id: 101,
    title: 'Design Team Brainstorming',
    date: '2023-04-14T11:00:00',
    duration: 75,
    participants: 6,
    recording: true,
    roomId: 'ghi-jkl-456',
  },
  {
    id: 102,
    title: 'Quarterly Planning',
    date: '2023-04-13T13:00:00',
    duration: 120,
    participants: 15,
    recording: true,
    roomId: 'stu-vwx-123',
  },
  {
    id: 103,
    title: 'New Feature Demo',
    date: '2023-04-12T15:30:00',
    duration: 45,
    participants: 9,
    recording: false,
    roomId: 'def-789-abc',
  },
];

const mockSavedMeetings = [
  {
    id: 201,
    title: 'Team Standup',
    description: 'Daily team standup meeting',
    participants: 7,
    isStarred: true,
    roomId: 'standup-123',
  },
  {
    id: 202,
    title: 'Client Check-in',
    description: 'Weekly client progress update',
    participants: 4,
    isStarred: true,
    roomId: 'client-456',
  },
];

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [tabValue, setTabValue] = useState(0);
  const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [savedMeetings, setSavedMeetings] = useState([]);
  const [joinMeetingOpen, setJoinMeetingOpen] = useState(false);
  const [joinMeetingId, setJoinMeetingId] = useState('');
  const [joinMeetingError, setJoinMeetingError] = useState('');
  const [joinMeetingPasscode, setJoinMeetingPasscode] = useState('');
  const [requiresPasscode, setRequiresPasscode] = useState(false);
  const [validatingMeeting, setValidatingMeeting] = useState(false);
  const [validatedMeetingId, setValidatedMeetingId] = useState(null);
  const [organizationRestricted, setOrganizationRestricted] = useState(false);
  const [organizationDomain, setOrganizationDomain] = useState('');

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setUpcomingMeetings(mockUpcomingMeetings);
      setRecentMeetings(mockRecentMeetings);
      setSavedMeetings(mockSavedMeetings);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateMeeting = () => {
    setOpenMeetingDialog(true);
  };

  const handleJoinMeeting = () => {
    setJoinMeetingOpen(true);
  };

  const handleStartInstantMeeting = () => {
    // In a real app, would create a meeting and redirect to the room
    const meetingId = 'instant-' + Math.random().toString(36).substring(2, 9);
    navigate(`/room/${meetingId}`);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes
      ? `${hours} hr ${remainingMinutes} min`
      : `${hours} hr`;
  };

  const handleJoinRoom = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  const handleJoinMeetingSubmit = async () => {
    if (validatingMeeting) {
      // We already validated the meeting ID, now we need to join with the passcode
      try {
        // Join the meeting with passcode
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rooms/${validatedMeetingId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            passcode: joinMeetingPasscode
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setJoinMeetingError(data.message || 'Failed to join meeting');
          return;
        }
        
        // Reset state and navigate to the room
        setJoinMeetingOpen(false);
        setJoinMeetingId('');
        setJoinMeetingPasscode('');
        setRequiresPasscode(false);
        setValidatingMeeting(false);
        setValidatedMeetingId(null);
        
        // Navigate to the meeting room
        navigate(`/room/${data.roomId}`);
      } catch (error) {
        console.error('Error joining meeting:', error);
        setJoinMeetingError('An error occurred while joining the meeting');
      }
    } else {
      // First step: validate the meeting ID
      if (!joinMeetingId.trim()) {
        setJoinMeetingError('Please enter a meeting ID');
        return;
      }
      
      try {
        setJoinMeetingError('');
        
        // Validate meeting ID via API
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rooms/${joinMeetingId}/validate`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setJoinMeetingError(data.message || 'Invalid meeting ID');
          return;
        }
        
        if (data.organizationRestricted) {
          setOrganizationRestricted(true);
          setOrganizationDomain(data.organizationDomain || '');
          
          if (!data.valid) {
            setJoinMeetingError(data.message || `This meeting is restricted to ${data.organizationDomain} email addresses`);
            return;
          }
        }
        
        if (data.requiresPasscode) {
          // Meeting requires a passcode
          setRequiresPasscode(true);
          setValidatingMeeting(true);
          setValidatedMeetingId(joinMeetingId);
          return;
        }
        
        // No passcode required, join directly
        const joinResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rooms/${joinMeetingId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({})
        });
        
        const joinData = await joinResponse.json();
        
        if (!joinResponse.ok) {
          setJoinMeetingError(joinData.message || 'Failed to join meeting');
          return;
        }
        
        // Close dialog and navigate to room
        setJoinMeetingOpen(false);
        navigate(`/room/${joinData.roomId}`);
      } catch (error) {
        console.error('Error validating meeting:', error);
        setJoinMeetingError('An error occurred. Please try again.');
      }
    }
  };

  const resetJoinMeetingDialog = () => {
    setJoinMeetingId('');
    setJoinMeetingPasscode('');
    setJoinMeetingError('');
    setRequiresPasscode(false);
    setValidatingMeeting(false);
    setValidatedMeetingId(null);
    setOrganizationRestricted(false);
    setOrganizationDomain('');
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (tabValue) {
      case 0: // Upcoming
        return (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <React.Fragment key={meeting.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 2,
                      px: { xs: 1, sm: 2 },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      >
                        <CalendarTodayIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="h6" component="div">
                          {meeting.title}
                          {meeting.isRecurring && (
                            <Chip
                              size="small"
                              label="Recurring"
                              sx={{
                                ml: 1,
                                fontSize: '0.65rem',
                                height: 20,
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main,
                              }}
                            />
                          )}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <AccessTimeIcon
                              fontSize="small"
                              sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }}
                            />
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {formatDate(meeting.date)} · {formatDuration(meeting.duration)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <PeopleOutlineIcon
                              fontSize="small"
                              sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }}
                            />
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {meeting.participants} participants
                            </Typography>
                          </Box>
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VideocamIcon />}
                        onClick={() => handleJoinRoom(meeting.roomId)}
                        sx={{ 
                          borderRadius: 2,
                          mr: { xs: 0, sm: 1 },
                          mb: { xs: 1, sm: 0 },
                        }}
                      >
                        Join
                      </Button>
                      <IconButton edge="end" aria-label="more options">
                        <MoreVertIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No upcoming meetings scheduled
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                  onClick={handleCreateMeeting}
                >
                  Schedule a Meeting
                </Button>
              </Box>
            )}
          </List>
        );
      case 1: // Recent
        return (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {recentMeetings.length > 0 ? (
              recentMeetings.map((meeting) => (
                <React.Fragment key={meeting.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 2,
                      px: { xs: 1, sm: 2 },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: theme.palette.secondary.main,
                        }}
                      >
                        <HistoryIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="h6" component="div">
                          {meeting.title}
                          {meeting.recording && (
                            <Chip
                              size="small"
                              label="Recording"
                              sx={{
                                ml: 1,
                                fontSize: '0.65rem',
                                height: 20,
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: theme.palette.error.main,
                              }}
                            />
                          )}
                        </Typography>
                      }
                      secondary={
                        <React.Fragment>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <AccessTimeIcon
                              fontSize="small"
                              sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }}
                            />
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {formatDate(meeting.date)} · {formatDuration(meeting.duration)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <PeopleOutlineIcon
                              fontSize="small"
                              sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }}
                            />
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {meeting.participants} participants
                            </Typography>
                          </Box>
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleJoinRoom(meeting.roomId)}
                        sx={{ 
                          borderRadius: 2,
                          mr: { xs: 0, sm: 1 },
                          mb: { xs: 1, sm: 0 },
                        }}
                      >
                        Restart
                      </Button>
                      <IconButton edge="end" aria-label="more options">
                        <MoreVertIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No recent meetings found
                </Typography>
              </Box>
            )}
          </List>
        );
      case 2: // Saved
        return (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {savedMeetings.length > 0 ? (
              savedMeetings.map((meeting) => (
                <React.Fragment key={meeting.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      py: 2,
                      px: { xs: 1, sm: 2 },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                        }}
                      >
                        <BookmarkIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h6" component="div">
                            {meeting.title}
                          </Typography>
                          {meeting.isStarred && (
                            <StarIcon
                              sx={{
                                ml: 1,
                                color: theme.palette.warning.main,
                                fontSize: '1.2rem',
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {meeting.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <PeopleOutlineIcon
                              fontSize="small"
                              sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }}
                            />
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {meeting.participants} participants
                            </Typography>
                          </Box>
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<VideocamIcon />}
                        onClick={() => handleJoinRoom(meeting.roomId)}
                        sx={{ 
                          borderRadius: 2,
                          mr: { xs: 0, sm: 1 },
                        }}
                      >
                        Start
                      </Button>
                      <IconButton edge="end" aria-label="more options">
                        <MoreVertIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No saved meetings found
                </Typography>
              </Box>
            )}
          </List>
        );
      default:
        return null;
    }
  };

  const renderJoinMeetingDialog = () => {
    return (
      <Dialog
        open={joinMeetingOpen}
        onClose={() => {
          setJoinMeetingOpen(false);
          resetJoinMeetingDialog();
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {validatingMeeting ? 'Enter Meeting Passcode' : 'Join Meeting'}
        </DialogTitle>
        <DialogContent>
          {organizationRestricted && (
            <Box sx={{ mb: 2, p: 1, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 1 }}>
              <Typography variant="body2" color="warning.main">
                This meeting is restricted to {organizationDomain} email addresses
              </Typography>
            </Box>
          )}
          
          {!validatingMeeting ? (
            <TextField
              autoFocus
              margin="dense"
              id="meetingId"
              label="Meeting ID"
              type="text"
              fullWidth
              variant="outlined"
              value={joinMeetingId}
              onChange={(e) => {
                setJoinMeetingId(e.target.value);
                if (joinMeetingError) setJoinMeetingError('');
              }}
              error={!!joinMeetingError}
              helperText={joinMeetingError}
              sx={{ mt: 1 }}
            />
          ) : (
            <TextField
              autoFocus
              margin="dense"
              id="passcode"
              label="Passcode"
              type="text"
              fullWidth
              variant="outlined"
              value={joinMeetingPasscode}
              onChange={(e) => {
                setJoinMeetingPasscode(e.target.value);
                if (joinMeetingError) setJoinMeetingError('');
              }}
              error={!!joinMeetingError}
              helperText={joinMeetingError}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              if (validatingMeeting) {
                setValidatingMeeting(false);
                setRequiresPasscode(false);
                setValidatedMeetingId(null);
              } else {
                setJoinMeetingOpen(false);
                resetJoinMeetingDialog();
              }
            }}
          >
            {validatingMeeting ? 'Back' : 'Cancel'}
          </Button>
          <Button onClick={handleJoinMeetingSubmit} variant="contained">
            {validatingMeeting ? 'Join Meeting' : 'Next'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 4 } }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Welcome back, {currentUser?.firstName || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your meetings and connect with your team
        </Typography>
      </Box>

      {/* Quick Action Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={0}
            className="card-hover"
            sx={{
              height: '100%',
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              p: 1,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <VideoCallIcon />
                </Avatar>
                <Typography variant="h6" component="div" sx={{ ml: 2 }}>
                  Start Meeting
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Begin an instant meeting and invite participants to join
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={handleStartInstantMeeting}
                sx={{ borderRadius: 2 }}
              >
                Start Now
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={0}
            className="card-hover"
            sx={{
              height: '100%',
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              p: 1,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    color: theme.palette.secondary.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <ScheduleIcon />
                </Avatar>
                <Typography variant="h6" component="div" sx={{ ml: 2 }}>
                  Schedule Meeting
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Plan ahead and schedule a meeting for a future date and time
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                onClick={handleCreateMeeting}
                sx={{ borderRadius: 2 }}
              >
                Schedule
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            elevation={0}
            className="card-hover"
            sx={{
              height: '100%',
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              p: 1,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    width: 48,
                    height: 48,
                  }}
                >
                  <LinkIcon />
                </Avatar>
                <Typography variant="h6" component="div" sx={{ ml: 2 }}>
                  Join Meeting
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Enter a meeting ID or link to join an existing meeting
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                fullWidth
                onClick={handleJoinMeeting}
                sx={{ borderRadius: 2 }}
              >
                Join
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Meetings List Section */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          mb: 4,
        }}
      >
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h5" component="h2" fontWeight={600}>
            Your Meetings
          </Typography>
          <TextField
            placeholder="Search meetings..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
            sx={{ width: { xs: '100%', sm: 'auto' }, mt: { xs: 2, sm: 0 } }}
          />
        </Box>
        
        <Divider />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="meeting tabs"
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab 
              icon={<TodayIcon />} 
              iconPosition="start" 
              label="Upcoming" 
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab 
              icon={<HistoryIcon />} 
              iconPosition="start" 
              label="Recent" 
              id="tab-1"
              aria-controls="tabpanel-1"
            />
            <Tab 
              icon={<BookmarkIcon />} 
              iconPosition="start" 
              label="Saved" 
              id="tab-2"
              aria-controls="tabpanel-2"
            />
          </Tabs>
        </Box>
        
        <Box role="tabpanel" id={`tabpanel-${tabValue}`} aria-labelledby={`tab-${tabValue}`}>
          {renderTabContent()}
        </Box>
      </Paper>

      {renderJoinMeetingDialog()}

      <CreateMeetingDialog
        open={openMeetingDialog}
        onClose={() => setOpenMeetingDialog(false)}
      />
    </Box>
  );
};

export default Dashboard; 