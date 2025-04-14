import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme, Fade } from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser } = useAuth();
  
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        transition: theme.transitions.create(['background-color', 'color'], {
          duration: theme.transitions.duration.standard,
        }),
      }}
    >
      <Header 
        isMobile={isMobile}
        toggleSidebar={handleToggleSidebar}
      />
      
      <Box sx={{ 
        display: 'flex', 
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {currentUser && (
          <Sidebar 
            open={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            variant={isMobile ? "temporary" : "permanent"}
          />
        )}
        
        <Fade in={true} timeout={800}>
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1,
              width: '100%',
              pt: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 4, md: 5 },
              px: { xs: 2, sm: 3, md: 4 },
              transition: theme.transitions.create(['margin', 'width', 'padding'], {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
              backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(0, 229, 255, 0.03) 0%, transparent 40%)',
              ...(currentUser && !isMobile && {
                width: `calc(100% - 240px)`,
                marginLeft: '240px',
                transition: theme.transitions.create(['margin', 'width'], {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                boxShadow: 'inset 3px 0 8px rgba(0,0,0,0.2)',
              }),
              minHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Outlet />
          </Box>
        </Fade>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default MainLayout; 