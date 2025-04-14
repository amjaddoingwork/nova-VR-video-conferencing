import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, CardHeader, Avatar } from '@mui/material';
import { 
  Videocam as VideocamIcon, 
  ViewInAr as ViewInArIcon, 
  Landscape as LandscapeIcon,
  ScreenShare as ScreenShareIcon,
  Chat as ChatIcon,
  Face as FaceIcon,
  Add as AddIcon,
  Devices as DevicesIcon
} from '@mui/icons-material';

const features = [
  {
    title: "HD Video Conferencing",
    description: "Crystal-clear video and audio with adaptive quality adjustment ensures smooth communication regardless of internet conditions.",
    icon: <VideocamIcon sx={{ fontSize: 40 }} />,
    color: "primary.main"
  },
  {
    title: "Immersive VR Mode",
    description: "Switch to Virtual Reality mode with a single click for a truly immersive meeting experience with customizable avatars.",
    icon: <ViewInArIcon sx={{ fontSize: 40 }} />,
    color: "secondary.main"
  },
  {
    title: "Multiple Virtual Environments",
    description: "Choose from auditorium, boardroom, classroom, conference room, outdoor, or futuristic settings for your virtual meetings.",
    icon: <LandscapeIcon sx={{ fontSize: 40 }} />,
    color: "primary.main"
  },
  {
    title: "Interactive Screen Sharing",
    description: "Share your screen in both video and VR modes with high-quality display on virtual presentation screens.",
    icon: <ScreenShareIcon sx={{ fontSize: 40 }} />,
    color: "secondary.main"
  },
  {
    title: "Real-time Chat",
    description: "Communicate via text with read receipts and emoji support without interrupting the flow of the meeting.",
    icon: <ChatIcon sx={{ fontSize: 40 }} />,
    color: "primary.main"
  },
  {
    title: "Customizable Avatars",
    description: "Personalize your virtual presence with customizable avatars that represent you in the VR environment.",
    icon: <FaceIcon sx={{ fontSize: 40 }} />,
    color: "secondary.main"
  },
  {
    title: "One-Click Meeting Creation",
    description: "Create and share meeting links instantly with no downloads required for participants to join.",
    icon: <AddIcon sx={{ fontSize: 40 }} />,
    color: "primary.main"
  },
  {
    title: "Cross-Platform Compatibility",
    description: "Join meetings from any modern browser on desktop or mobile devices with responsive design.",
    icon: <DevicesIcon sx={{ fontSize: 40 }} />,
    color: "secondary.main"
  }
];

const Features = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom className="text-gradient">
          Features
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
          Nova Meet combines traditional video conferencing with cutting-edge VR technology to provide an unmatched meeting experience
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card className="card-hover" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: feature.color }}>
                    {feature.icon}
                  </Avatar>
                }
                title={<Typography variant="h5">{feature.title}</Typography>}
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Features; 