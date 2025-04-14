import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha,
  Avatar,
  Typography,
  Badge,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  VideoCall as VideoCallIcon,
  People as PeopleIcon,
  CalendarMonth as CalendarIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  VideoLibrary as RecordingsIcon,
  Schedule as ScheduledIcon,
  Stars as FeaturedIcon,
  ExpandLess,
  ExpandMore,
  Bookmark as BookmarkIcon,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [meetingsOpen, setMeetingsOpen] = React.useState(true);

  const handleMeetingsClick = () => {
    setMeetingsOpen(!meetingsOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (variant === 'temporary') {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const ListItemStyle = ({ path, icon, primary, notifications, onClick }) => {
    const active = isActive(path);
    return (
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => onClick ? onClick() : handleNavigation(path)}
          sx={{
            minHeight: 48,
            borderRadius: 2,
            mb: 0.5,
            backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            color: active ? theme.palette.primary.main : 'inherit',
            '&:hover': {
              backgroundColor: active
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              color: active ? theme.palette.primary.main : 'inherit',
            }}
          >
            {notifications ? (
              <Badge badgeContent={notifications} color="error">
                {icon}
              </Badge>
            ) : (
              icon
            )}
          </ListItemIcon>
          <ListItemText
            primary={primary}
            primaryTypographyProps={{
              fontWeight: active ? 600 : 400,
            }}
          />
          {onClick && (meetingsOpen ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          backgroundImage: 'none',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      {/* User Profile Section */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          alt={currentUser?.name || 'User'}
          src={currentUser?.avatar || ''}
          sx={{
            width: 48,
            height: 48,
            border: `2px solid ${theme.palette.primary.main}`,
          }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {currentUser?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentUser?.email || 'user@example.com'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, mb: 2 }} />

      {/* Navigation Menu */}
      <Box sx={{ px: 2, pb: 2, overflowY: 'auto' }}>
        <List component="nav" disablePadding>
          <ListItemStyle
            path="/dashboard"
            icon={<DashboardIcon />}
            primary="Dashboard"
          />

          <ListItemStyle
            path="/meetings"
            icon={<VideoCallIcon />}
            primary="Meetings"
            onClick={handleMeetingsClick}
          />

          <Collapse in={meetingsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 3 }}>
              <ListItemStyle
                path="/meetings/new"
                icon={<ChevronRightIcon />}
                primary="New Meeting"
              />
              <ListItemStyle
                path="/meetings/join"
                icon={<ChevronRightIcon />}
                primary="Join Meeting"
              />
              <ListItemStyle
                path="/meetings/scheduled"
                icon={<ChevronRightIcon />}
                primary="Scheduled"
              />
            </List>
          </Collapse>

          <ListItemStyle
            path="/contacts"
            icon={<PeopleIcon />}
            primary="Contacts"
          />

          <ListItemStyle
            path="/calendar"
            icon={<CalendarIcon />}
            primary="Calendar"
          />

          <ListItemStyle
            path="/recordings"
            icon={<RecordingsIcon />}
            primary="Recordings"
          />

          <ListItemStyle
            path="/history"
            icon={<HistoryIcon />}
            primary="History"
          />

          <ListItemStyle
            path="/starred"
            icon={<FeaturedIcon />}
            primary="Starred"
          />

          <Divider sx={{ my: 2 }} />

          <ListItemStyle
            path="/messages"
            icon={<MailIcon />}
            primary="Messages"
            notifications={3}
          />

          <ListItemStyle
            path="/notifications"
            icon={<NotificationsIcon />}
            primary="Notifications"
            notifications={5}
          />

          <ListItemStyle
            path="/bookmarks"
            icon={<BookmarkIcon />}
            primary="Bookmarks"
          />

          <Divider sx={{ my: 2 }} />

          <ListItemStyle
            path="/settings"
            icon={<SettingsIcon />}
            primary="Settings"
          />
        </List>
      </Box>

      {/* Bottom Section */}
      <Box
        sx={{
          p: 2,
          mt: 'auto',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
            }}
          >
            <VideoCallIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Premium Plan
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Upgrade for more features
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 