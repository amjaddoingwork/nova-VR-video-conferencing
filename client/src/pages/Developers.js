import React from 'react';
import { Container, Typography, Box, Paper, Avatar } from '@mui/material';
import { Code as CodeIcon } from '@mui/icons-material';

const Developers = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom className="text-gradient">
          Developers
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
          Meet the developer behind Nova Meet
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
          textAlign: 'center',
          maxWidth: 500,
          mx: 'auto'
        }}
      >
        <Avatar
          sx={{ 
            width: 120, 
            height: 120, 
            bgcolor: 'primary.main',
            mb: 3
          }}
        >
          <CodeIcon sx={{ fontSize: 60 }} />
        </Avatar>
        <Typography variant="h4" gutterBottom>
          AMJAD IMRAN
        </Typography>
        <Typography variant="subtitle1" color="primary.main" gutterBottom>
          Lead Developer
        </Typography>
        <Typography variant="body1" gutterBottom>
          2022UIT3079
        </Typography>
        <Typography variant="body1">
          IT1
        </Typography>
      </Paper>
    </Container>
  );
};

export default Developers; 