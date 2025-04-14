import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useTheme,
  alpha,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  VideoCall as VideoCallIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import CreateMeetingDialog from './CreateMeetingDialog';

const Header = ({ isMobile, toggleSidebar }) => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [openCreateMeeting, setOpenCreateMeeting] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser, logout } = useAuth();

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
    navigate('/');
  };

  const appBarStyle = {
    backdropFilter: 'blur(20px)',
    backgroundColor: alpha(
      theme.palette.background.paper,
      0.8
    ),
    boxShadow: `0 4px 20px 0 ${alpha(theme.palette.common.black, 0.2)}`,
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
    transition: theme.transitions.create(['background-color', 'box-shadow', 'border-bottom'], {
      duration: theme.transitions.duration.standard,
    }),
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={appBarStyle}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {currentUser && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleSidebar}
                sx={{ 
                  mr: 2, 
                  display: { md: 'none' },
                  '&:hover': {
                    transform: 'scale(1.1)',
                    color: theme.palette.primary.main,
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: 2,
                cursor: 'pointer',
                '&:hover': {
                  '& .logo-icon': {
                    transform: 'rotate(-10deg) scale(1.1)',
                  },
                  '& .logo-text': {
                    letterSpacing: '0.12rem',
                  }
                },
              }}
              onClick={() => navigate('/')}
            >
              <VideoCallIcon
                className="logo-icon"
                sx={{
                  mr: 1,
                  color: theme.palette.primary.main,
                  fontSize: '2.2rem',
                  transition: 'transform 0.3s ease',
                }}
              />
              <Typography
                variant="h6"
                noWrap
                className="logo-text"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.1rem',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: { xs: 'none', sm: 'block' },
                  transition: 'letter-spacing 0.3s ease',
                }}
              >
                NOVA MEET
              </Typography>
            </Box>

            {/* Navigation Links - Desktop */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {!currentUser ? (
                <>
                  <Button
                    component={RouterLink}
                    to="/"
                    sx={{ 
                      my: 2, 
                      mx: 0.5,
                      px: 2,
                      display: 'block',
                      position: 'relative',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&::after': {
                          width: '80%',
                        }
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '10px',
                        left: '10%',
                        width: '0%',
                        height: '2px',
                        backgroundColor: theme.palette.primary.main,
                        transition: 'width 0.3s ease',
                      },
                    }}
                  >
                    Home
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/features"
                    sx={{ 
                      my: 2, 
                      mx: 0.5,
                      px: 2,
                      display: 'block',
                      position: 'relative',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&::after': {
                          width: '80%',
                        }
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '10px',
                        left: '10%',
                        width: '0%',
                        height: '2px',
                        backgroundColor: theme.palette.primary.main,
                        transition: 'width 0.3s ease',
                      },
                    }}
                  >
                    Features
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/download"
                    sx={{ 
                      my: 2, 
                      mx: 0.5,
                      px: 2,
                      display: 'block',
                      position: 'relative',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&::after': {
                          width: '80%',
                        }
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '10px',
                        left: '10%',
                        width: '0%',
                        height: '2px',
                        backgroundColor: theme.palette.primary.main,
                        transition: 'width 0.3s ease',
                      },
                    }}
                  >
                    Download
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/about"
                    sx={{ 
                      my: 2, 
                      mx: 0.5,
                      px: 2,
                      display: 'block',
                      position: 'relative',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&::after': {
                          width: '80%',
                        }
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '10px',
                        left: '10%',
                        width: '0%',
                        height: '2px',
                        backgroundColor: theme.palette.primary.main,
                        transition: 'width 0.3s ease',
                      },
                    }}
                  >
                    About
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={RouterLink}
                    to="/dashboard"
                    sx={{ 
                      my: 2, 
                      mx: 0.5,
                      px: 2,
                      display: 'block',
                      position: 'relative',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        '&::after': {
                          width: '80%',
                        }
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '10px',
                        left: '10%',
                        width: '0%',
                        height: '2px',
                        backgroundColor: theme.palette.primary.main,
                        transition: 'width 0.3s ease',
                      },
                    }}
                    startIcon={<DashboardIcon />}
                  >
                    Dashboard
                  </Button>
                </>
              )}
            </Box>

            {/* Right Side Items */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              {/* Create Meeting Button */}
              {currentUser && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreateMeeting(true)}
                  sx={{
                    borderRadius: '20px',
                    mr: 2,
                    display: { xs: 'none', sm: 'flex' },
                    boxShadow: `0 4px 14px 0 ${alpha(theme.palette.primary.main, 0.4)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px 0 ${alpha(theme.palette.primary.main, 0.6)}`,
                    }
                  }}
                >
                  New Meeting
                </Button>
              )}

              {/* Notifications */}
              {currentUser && (
                <Tooltip title="Notifications">
                  <IconButton 
                    onClick={handleOpenNotificationsMenu} 
                    sx={{ 
                      ml: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Badge 
                      badgeContent={3} 
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': {
                              boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.7)}`
                            },
                            '70%': {
                              boxShadow: `0 0 0 5px ${alpha(theme.palette.error.main, 0)}`
                            },
                            '100%': {
                              boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}`
                            }
                          }
                        }
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
              )}

              {/* User Menu */}
              {currentUser ? (
                <>
                  <Tooltip title="Open settings">
                    <IconButton 
                      onClick={handleOpenUserMenu} 
                      sx={{ 
                        ml: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <Avatar
                        alt={currentUser.name}
                        src={currentUser.avatar || ''}
                        sx={{
                          width: 40,
                          height: 40,
                          border: `2px solid ${theme.palette.primary.main}`,
                          boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.4)}`,
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                    PaperProps={{
                      elevation: 4,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 12px rgba(0,0,0,0.15))',
                        mt: 1.5,
                        width: 240,
                        borderRadius: 2,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                  >
                    <Box sx={{ 
                      px: 2, 
                      py: 1.5,
                      background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {currentUser.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentUser.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/dashboard'); }}>
                      <ListItemIcon>
                        <DashboardIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Dashboard" />
                    </MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Profile" />
                    </MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }}>
                      <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Settings" />
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Logout" />
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
                  <Button
                    variant="outlined"
                    component={RouterLink}
                    to="/login"
                    sx={{ borderRadius: '20px' }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/register"
                    sx={{ borderRadius: '20px', display: { xs: 'none', sm: 'block' } }}
                  >
                    Sign Up
                  </Button>
                </Stack>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Notifications Menu */}
      <Menu
        sx={{ mt: '45px' }}
        id="notifications-menu"
        anchorEl={anchorElNotifications}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorElNotifications)}
        onClose={handleCloseNotificationsMenu}
        PaperProps={{
          elevation: 2,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
            mt: 1.5,
            width: 320,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Notifications
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleCloseNotificationsMenu}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={500}>
              Meeting Reminder
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Team standup meeting in 10 minutes
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleCloseNotificationsMenu}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={500}>
              New Message
            </Typography>
            <Typography variant="caption" color="text.secondary">
              John Doe sent you a message
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleCloseNotificationsMenu}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" fontWeight={500}>
              Meeting Invitation
            </Typography>
            <Typography variant="caption" color="text.secondary">
              You've been invited to a project discussion
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
          <Button size="small">See All Notifications</Button>
        </Box>
      </Menu>

      {/* Create Meeting Dialog */}
      <CreateMeetingDialog
        open={openCreateMeeting}
        onClose={() => setOpenCreateMeeting(false)}
      />
    </>
  );
};

export default Header; 