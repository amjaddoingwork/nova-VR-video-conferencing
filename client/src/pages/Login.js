import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Link,
  Grid,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  Checkbox,
  FormControlLabel,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import GuestLoginModal from '../components/GuestLoginModal';
import { isGuestUser, getGuestData, generateGuestToken, storeGuestToken } from '../utils/temporaryAuth';

const Login = () => {
  const theme = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('guest') === 'true') {
      setIsGuestModalOpen(true);
    }
  }, [location]);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rememberMe' ? checked : value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        await login(formData.email, formData.password);
        // Successful login
        navigate(from, { replace: true });
      } catch (error) {
        setServerError(
          error.response?.data?.message || 
          'Login failed. Please check your credentials and try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setIsLoading(true);
      setServerError(null);
      
      // Create mock user data based on the provider
      let mockUserData = {
        name: `${provider} User`,
        email: `${provider.toLowerCase()}user@example.com`,
        id: `${provider.toLowerCase()}-123`,
        provider
      };
      
      // Instead of using non-existent methods like login.googleLogin,
      // use the main login method or create a guest session
      try {
        // Just create a guest login with the social provider name
        const { token, guestData } = generateGuestToken(`${provider} User`);
        storeGuestToken(token);
        console.log(`Created ${provider} guest login:`, guestData);
        
        // Redirect to dashboard or meeting
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      } catch (error) {
        console.error(`${provider} login failed:`, error);
        setServerError(`${provider} login failed: ${error.message}`);
      }
    } catch (error) {
      setServerError(error.message || `${provider} login failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLoginSuccess = (guestData) => {
    console.log('Guest login successful:', guestData);
    // Redirect to dashboard or directly to meeting
    navigate('/dashboard');
  };

  return (
    <Container component="main" maxWidth="lg">
      <Grid 
        container 
        sx={{ 
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Grid 
          item 
          xs={12} 
          sm={8} 
          md={9} 
          component={Paper} 
          elevation={6} 
          square
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            height: { sm: '600px' },
          }}
        >
          {/* Brand Section */}
          <Box
            sx={{
              flex: { md: '0 0 50%' },
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.4)} 0%, ${alpha(theme.palette.primary.light, 0)} 70%)`,
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '5%',
                right: '5%',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.3)} 0%, ${alpha(theme.palette.secondary.main, 0)} 70%)`,
                zIndex: 0,
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Typography 
                component="h1" 
                variant="h3" 
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                Welcome Back!
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
                Sign in to access your account and continue your video conferencing journey.
              </Typography>

              <Box 
                component="img"
                src="/images/login-illustration.svg"
                alt="Login Illustration"
                sx={{ 
                  maxWidth: '90%',
                  height: 'auto',
                  mt: 2,
                }}
              />
            </Box>
          </Box>

          {/* Form Section */}
          <Box
            sx={{
              flex: { md: '0 0 50%' },
              p: { xs: 3, sm: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography component="h1" variant="h4" fontWeight={700}>
                Sign In
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Please enter your credentials to continue
              </Typography>
            </Box>

            {serverError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {serverError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center', 
                  mt: 1,
                  mb: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      name="rememberMe"
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
                <Link 
                  component={RouterLink} 
                  to="/forgot-password"
                  variant="body2"
                  color="primary"
                >
                  Forgot password?
                </Link>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  borderRadius: 8,
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 1, mb: 3 }}>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/register" color="primary" fontWeight={600}>
                    Sign Up
                  </Link>
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR CONTINUE WITH
                </Typography>
              </Divider>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    startIcon={<GoogleIcon />}
                    onClick={() => handleSocialLogin('Google')}
                    sx={{ 
                      borderRadius: 2,
                      py: 1,
                    }}
                  >
                    Google
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    startIcon={<GitHubIcon />}
                    onClick={() => handleSocialLogin('GitHub')}
                    sx={{ 
                      borderRadius: 2,
                      py: 1,
                    }}
                  >
                    GitHub
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    startIcon={<TwitterIcon />}
                    onClick={() => handleSocialLogin('Twitter')}
                    sx={{ 
                      borderRadius: 2,
                      py: 1,
                    }}
                  >
                    Twitter
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  Don't have an account?
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={() => setIsGuestModalOpen(true)}
                  >
                    Join as Guest
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <GuestLoginModal
        open={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onSuccess={handleGuestLoginSuccess}
      />
    </Container>
  );
};

export default Login; 