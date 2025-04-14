import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0)} 70%)`,
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h1"
          component="h1"
          color="primary"
          sx={{ 
            fontSize: { xs: '6rem', md: '10rem' },
            fontWeight: 800,
            letterSpacing: '-0.05em',
            mb: 2,
            textShadow: `2px 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          404
        </Typography>
        
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ 
            fontWeight: 600,
            mb: 3,
          }}
        >
          Page Not Found
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ 
            mb: 4,
            maxWidth: '600px',
            mx: 'auto',
          }}
        >
          Oops! The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable. Please check the URL or go back to the homepage.
        </Typography>
        
        <Box 
          component="img"
          src="/images/404-illustration.svg"
          alt="404 Not Found"
          sx={{ 
            maxWidth: '100%',
            height: 'auto',
            maxHeight: '300px',
            my: 4,
          }}
        />
        
        <Button
          component={RouterLink}
          to="/"
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          sx={{
            py: 1.5,
            px: 4,
            borderRadius: 8,
            mt: 2,
            boxShadow: theme.shadows[4],
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: theme.shadows[8],
            },
            transition: 'all 0.3s ease',
          }}
        >
          Back to Home
        </Button>
      </Container>
    </Box>
  );
};

export default NotFound; 