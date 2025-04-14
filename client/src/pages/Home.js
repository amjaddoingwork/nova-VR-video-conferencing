import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Devices as DevicesIcon,
} from '@mui/icons-material';

const Home = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <VideoCallIcon sx={{ fontSize: 40 }} />,
      title: 'HD Video Meetings',
      description: 'Crystal clear video quality for seamless communication.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure & Private',
      description: 'End-to-end encryption for your peace of mind.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Lightning Fast',
      description: 'Minimal latency for real-time collaboration.',
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 40 }} />,
      title: 'Cross-Platform',
      description: 'Works on any device, anywhere, anytime.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Connect with Anyone, Anywhere
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                Experience seamless video conferencing with Nova Meet. Start or join meetings instantly with just one click.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  startIcon={<VideoCallIcon />}
                  sx={{
                    mr: 2,
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                  }}
                >
                  Get Started
                </Button>
                <Button
                  component={RouterLink}
                  to="/features"
                  variant="outlined"
                  size="large"
                  sx={{ borderRadius: 2, py: 1.5, px: 4 }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/hero-image.png"
                alt="Video Conferencing"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  display: 'block',
                  margin: 'auto',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography
          variant="h3"
          component="h2"
          align="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 700 }}
        >
          Why Choose Nova Meet?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <Box
                  sx={{
                    color: theme.palette.primary.main,
                    mb: 2,
                  }}
                >
                  {feature.icon}
                </Box>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 