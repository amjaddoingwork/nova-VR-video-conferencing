import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const PageTemplate = ({ title, description = 'This page is coming soon!' }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom className="text-gradient">
          {title}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
          {description}
        </Typography>
      </Box>
      
      <Paper 
        elevation={0} 
        className="glass-effect" 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          We're working on this page
        </Typography>
        <Typography variant="body1">
          Check back soon for updates as we continue to expand and improve Nova Meet.
        </Typography>
      </Paper>
    </Container>
  );
};

export default PageTemplate; 