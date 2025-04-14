import React from 'react';
import { Container, Typography, Box, Paper, Grid, Avatar, Divider } from '@mui/material';
import { Person as PersonIcon, Code as CodeIcon, School as SchoolIcon, WorkOutline as WorkIcon } from '@mui/icons-material';

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom className="text-gradient">
          About Nova Meet
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
          We're transforming virtual meetings with immersive technology
        </Typography>
      </Box>
      
      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            At Nova Meet, we believe that meaningful connection shouldn't be limited by physical distance. 
            Our mission is to create virtual meeting experiences that feel as natural and engaging as being in the same room.
          </Typography>
          <Typography variant="body1" paragraph>
            By combining cutting-edge VR technology with intuitive design, we're building tools that bring people 
            together in ways that traditional video conferencing cannot match.
          </Typography>
          
          <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
            Our Story
          </Typography>
          <Typography variant="body1" paragraph>
            Nova Meet was founded in 2022 by a team of technologists who were frustrated with the 
            limitations of existing virtual meeting solutions. We saw an opportunity to create something 
            different - a platform that combines the accessibility of video conferencing with the immersion of virtual reality.
          </Typography>
          <Typography variant="body1">
            Since then, we've grown to a team of passionate individuals dedicated to pushing the boundaries 
            of what's possible in virtual communication.
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={0} className="glass-effect" sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Our Values
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Innovation
              </Typography>
              <Typography variant="body2">
                We're constantly exploring new technologies and approaches to create better 
                virtual meeting experiences.
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Accessibility
              </Typography>
              <Typography variant="body2">
                We believe everyone should be able to participate in immersive meetings, 
                regardless of technical expertise or hardware.
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Human Connection
              </Typography>
              <Typography variant="body2">
                Technology should enhance human connection, not replace it. We design with 
                people and their interactions at the center.
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom>
                Quality
              </Typography>
              <Typography variant="body2">
                We're committed to delivering reliable, high-quality experiences that our 
                users can depend on for their important meetings.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Our Team
        </Typography>
        <Typography variant="body1" align="center" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
          Meet the developer who made Nova Meet possible
        </Typography>
        
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={8} md={6} lg={4}>
            <Paper elevation={0} className="glass-effect" sx={{ p: 4, textAlign: 'center' }}>
              <Avatar 
                sx={{ width: 150, height: 150, mx: 'auto', mb: 3, bgcolor: 'primary.main' }}
              >
                <CodeIcon sx={{ fontSize: 80 }} />
              </Avatar>
              <Typography variant="h4" gutterBottom>AMJAD IMRAN</Typography>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Lead Developer
              </Typography>
              
              <Box sx={{ my: 3 }}>
                <Divider />
              </Box>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">2022UIT3079</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <WorkIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body1">IT1</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ my: 6 }} />
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Want to learn more?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Check out our features and see how Nova Meet can transform your virtual meetings.
        </Typography>
        <Box component="a" href="/features" sx={{ 
          display: 'inline-block',
          py: 1,
          px: 3,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
          textDecoration: 'none',
          '&:hover': {
            bgcolor: 'primary.dark',
          }
        }}>
          Explore Features
        </Box>
      </Box>
    </Container>
  );
};

export default About; 