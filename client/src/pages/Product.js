import React from 'react';
import { Container, Typography, Box, Grid, Paper, Button } from '@mui/material';
import { VideoCall, ViewInAr, Groups, Chat, ScreenShare } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Product = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom className="text-gradient">
          Nova Meet
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          The next generation of virtual meetings
        </Typography>
        <Button 
          component={Link} 
          to="/features" 
          variant="contained" 
          size="large" 
          sx={{ mr: 2 }}
        >
          Explore Features
        </Button>
        <Button 
          component={Link} 
          to="/download" 
          variant="outlined" 
          size="large"
        >
          Download Now
        </Button>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Experience Meetings in a New Dimension
            </Typography>
            <Typography variant="body1">
              Nova Meet combines traditional video conferencing with immersive virtual reality, 
              creating an unparalleled meeting experience that adapts to your needs.
            </Typography>
          </Box>
          
          <Box className="glass-effect" sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Why Nova Meet?
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>Seamless transition between video and VR modes</li>
              <li>Multiple interactive virtual environments</li>
              <li>High-quality video and audio streaming</li>
              <li>Advanced screen sharing capabilities</li>
              <li>Designed for both casual meetings and professional conferences</li>
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} className="glass-effect" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>Core Features</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VideoCall color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">HD Video Conferencing</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ViewInAr color="secondary" sx={{ mr: 2 }} />
                  <Typography variant="body1">Immersive VR Mode</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Groups color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">6 Virtual Environments</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chat color="secondary" sx={{ mr: 2 }} />
                  <Typography variant="body1">Real-time Chat</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScreenShare color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">Advanced Screen Sharing</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Product; 