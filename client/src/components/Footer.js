import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Link,
  Typography,
  IconButton,
  useTheme,
  alpha,
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <FacebookIcon fontSize="small" />, label: 'Facebook', href: 'https://facebook.com' },
    { icon: <TwitterIcon fontSize="small" />, label: 'Twitter', href: 'https://twitter.com' },
    { icon: <InstagramIcon fontSize="small" />, label: 'Instagram', href: 'https://instagram.com' },
    { icon: <LinkedInIcon fontSize="small" />, label: 'LinkedIn', href: 'https://linkedin.com' },
    { icon: <GitHubIcon fontSize="small" />, label: 'GitHub', href: 'https://github.com' },
  ];

  const footerLinks = {
    product: [
      { label: 'Features', to: '/features' },
      { label: 'Download', to: '/download' },
      { label: 'Updates', to: '/updates' },
    ],
    company: [
      { label: 'About', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Blog', to: '/blog' },
      { label: 'Press', to: '/press' },
    ],
    resources: [
      { label: 'Help Center', to: '/help' },
      { label: 'Community', to: '/community' },
      { label: 'Developers', to: '/developers' },
      { label: 'Partners', to: '/partners' },
    ],
    legal: [
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
      { label: 'Cookies', to: '/cookies' },
      { label: 'Licenses', to: '/licenses' },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        backgroundColor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.background.paper, 0.9)
          : alpha(theme.palette.grey[900], 0.05),
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        mt: 'auto',
        width: '100%',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, 
            ${alpha(theme.palette.primary.main, 0)}, 
            ${alpha(theme.palette.primary.main, 0.3)}, 
            ${alpha(theme.palette.secondary.main, 0.3)}, 
            ${alpha(theme.palette.primary.main, 0)}
          )`,
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                '&:hover': {
                  '& .footer-logo-icon': {
                    transform: 'rotate(-10deg)',
                  }
                },
              }}
            >
              <VideoCallIcon
                className="footer-logo-icon"
                sx={{
                  mr: 1,
                  color: theme.palette.primary.main,
                  fontSize: '2rem',
                  transition: 'transform 0.3s ease',
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '0.1rem',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NOVA MEET
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                maxWidth: '280px',
                lineHeight: 1.7,
              }}
            >
              Premium video conferencing for everyone. Connect, collaborate, and celebrate from anywhere.
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social, index) => (
                <Tooltip key={index} title={social.label} arrow placement="top">
                  <IconButton 
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small" 
                    color="primary" 
                    aria-label={social.label.toLowerCase()}
                    sx={{
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 5px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {social.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>
          </Grid>

          {Object.entries(footerLinks).map(([section, links], index) => (
            <Grid item xs={6} sm={3} md={2} key={section}>
              <Typography 
                variant="subtitle1" 
                fontWeight={600} 
                gutterBottom
                sx={{
                  position: 'relative',
                  display: 'inline-block',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    bottom: -4,
                    height: 2,
                    width: '40%',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
                  }
                }}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                {links.map((link, i) => (
                  <Box component="li" sx={{ mb: 1 }} key={i}>
                    <Link 
                      component={RouterLink} 
                      to={link.to} 
                      underline="none"
                      sx={{
                        color: 'text.secondary',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          pl: 0.5,
                        },
                        display: 'inline-block',
                      }}
                    >
                      {link.label}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider 
          sx={{ 
            my: 4,
            opacity: 0.1,
          }} 
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'center', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center"
            sx={{
              opacity: 0.8,
            }}
          >
            © {currentYear} Nova Meet. All rights reserved.
          </Typography>

          <Box sx={{ mt: { xs: 2, sm: 0 }, display: 'flex', gap: 2 }}>
            <Link 
              component={RouterLink}
              to="/privacy"
              color="inherit" 
              underline="none"
              sx={{ 
                opacity: 0.7,
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  opacity: 1,
                }
              }}
            >
              <Typography variant="body2" color="text.secondary" display="inline">
                Privacy Policy
              </Typography>
            </Link>
            <Link 
              component={RouterLink}
              to="/terms"
              color="inherit" 
              underline="none"
              sx={{ 
                opacity: 0.7,
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  opacity: 1,
                }
              }}
            >
              <Typography variant="body2" color="text.secondary" display="inline">
                Terms of Service
              </Typography>
            </Link>
            <Link 
              component={RouterLink}
              to="/help"
              color="inherit" 
              underline="none"
              sx={{ 
                opacity: 0.7,
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  opacity: 1,
                }
              }}
            >
              <Typography variant="body2" color="text.secondary" display="inline">
                Help & Support
              </Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 