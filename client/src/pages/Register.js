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
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  AlternateEmail as AlternateEmailIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const steps = ['Account Details', 'Personal Information', 'Terms & Conditions'];

const Register = () => {
  const theme = useTheme();
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    agreeToTerms: false,
    marketingEmails: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: '',
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeToTerms' || name === 'marketingEmails' ? checked : value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }

    // Calculate password strength when password field changes
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, feedback: '' });
      return;
    }

    // Simple password strength calculation
    let score = 0;
    let feedback = '';

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        feedback = 'Very weak';
        break;
      case 2:
        feedback = 'Weak';
        break;
      case 3:
        feedback = 'Moderate';
        break;
      case 4:
        feedback = 'Strong';
        break;
      case 5:
        feedback = 'Very strong';
        break;
      default:
        feedback = '';
    }

    setPasswordStrength({ score, feedback });
  };

  const validateStep = () => {
    const newErrors = {};

    if (activeStep === 0) {
      // Validate email
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email address is invalid';
      }
      
      // Validate password
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (passwordStrength.score < 3) {
        newErrors.password = 'Password is too weak. Please include upper and lowercase letters, numbers, and special characters.';
      }
      
      // Validate confirm password
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } 
    else if (activeStep === 1) {
      // Validate first name
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      
      // Validate last name
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      
      // Validate username
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and underscores';
      }
    }
    else if (activeStep === 2) {
      // Validate terms
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep()) {
      setIsLoading(true);
      setServerError('');
      
      try {
        // Call register method from auth context
        await register(
          formData.email,
          formData.password,
          {
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            marketingConsent: formData.marketingEmails,
          }
        );
        
        // Registration successful
        navigate('/dashboard');
      } catch (error) {
        setServerError(
          error.response?.data?.message || 
          'Registration failed. Please try again later.'
        );
        // If there's a specific field error, set it
        if (error.response?.data?.errors) {
          setErrors({
            ...errors,
            ...error.response.data.errors,
          });
          // If there's an email error, go back to step 0
          if (error.response.data.errors.email) {
            setActiveStep(0);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSocialRegister = (provider) => {
    // This would integrate with your backend social registration
    console.log(`Registering with ${provider}`);
    
    // For demo purposes, just navigate to dashboard
    navigate('/dashboard');
  };

  // Render password strength indicator
  const renderPasswordStrength = () => {
    if (!formData.password) return null;
    
    const { score, feedback } = passwordStrength;
    let color = '';
    
    switch (score) {
      case 0:
      case 1:
        color = theme.palette.error.main;
        break;
      case 2:
        color = theme.palette.warning.main;
        break;
      case 3:
        color = theme.palette.info.main;
        break;
      case 4:
      case 5:
        color = theme.palette.success.main;
        break;
      default:
        color = theme.palette.grey[500];
    }
    
    return (
      <Box sx={{ mt: 1, mb: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Password strength:
          </Typography>
          <Typography 
            variant="body2" 
            fontWeight={600}
            sx={{ color }}
          >
            {feedback}
          </Typography>
        </Box>
        <Box sx={{ width: '100%', display: 'flex', gap: 0.5 }}>
          {[1, 2, 3, 4, 5].map((segment) => (
            <Box
              key={segment}
              sx={{
                height: 4,
                width: '20%',
                borderRadius: 4,
                backgroundColor: score >= segment ? color : theme.palette.grey[300],
              }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
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
              autoComplete="new-password"
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
            {renderPasswordStrength()}
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      case 1:
        return (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleInputChange}
              error={!!errors.username}
              helperText={errors.username}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AlternateEmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                maxHeight: 200, 
                overflow: 'auto',
                mb: 3,
                borderColor: theme.palette.divider,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Terms and Conditions
              </Typography>
              <Typography variant="body2" paragraph>
                Welcome to Nova Meet. By registering an account, you agree to comply with and be bound by the following terms and conditions of use.
              </Typography>
              <Typography variant="body2" paragraph>
                Your use of our service is subject to your acceptance of and compliance with these terms. These terms apply to all visitors, users, and others who access or use the service.
              </Typography>
              <Typography variant="body2" paragraph>
                By accessing or using the service, you agree to be bound by these terms. If you disagree with any part of the terms, then you may not access the service.
              </Typography>
              <Typography variant="body2" paragraph>
                Nova Meet respects the privacy of its users and is committed to protecting the user's information. Our Privacy Policy, which is incorporated into these Terms by this reference, explains how we collect, use, and disclose information that pertains to your privacy.
              </Typography>
            </Paper>
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  name="agreeToTerms"
                  color="primary"
                />
              }
              label="I agree to the terms and conditions"
            />
            {errors.agreeToTerms && (
              <Typography color="error" variant="caption" sx={{ display: 'block', ml: 2 }}>
                {errors.agreeToTerms}
              </Typography>
            )}
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={formData.marketingEmails}
                  onChange={handleInputChange}
                  name="marketingEmails"
                  color="primary"
                />
              }
              label="I would like to receive marketing emails about Nova Meet services"
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
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
            height: { sm: '650px' },
          }}
        >
          {/* Brand Section */}
          <Box
            sx={{
              flex: { md: '0 0 40%' },
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
                Create an Account
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
                Join our community of professionals and enjoy seamless video conferencing
              </Typography>

              <Box 
                component="img"
                src="/images/register-illustration.svg"
                alt="Register Illustration"
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
              flex: { md: '0 0 60%' },
              p: { xs: 3, sm: 6 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {serverError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {serverError}
              </Alert>
            )}

            <Box component="form" onSubmit={activeStep === steps.length - 1 ? handleSubmit : handleNext} noValidate>
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<ArrowBackIcon />}
                  sx={{ visibility: activeStep === 0 ? 'hidden' : 'visible' }}
                >
                  Back
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={activeStep === steps.length - 1 ? null : <ArrowForwardIcon />}
                  sx={{ 
                    py: 1,
                    px: 3,
                    borderRadius: 8,
                  }}
                  disabled={isLoading}
                >
                  {isLoading 
                    ? 'Processing...' 
                    : activeStep === steps.length - 1 
                      ? 'Create Account' 
                      : 'Next'
                  }
                </Button>
              </Box>
              
              {activeStep === 0 && (
                <>
                  <Box sx={{ textAlign: 'center', mt: 3, mb: 3 }}>
                    <Typography variant="body2">
                      Already have an account?{' '}
                      <Link component={RouterLink} to="/login" color="primary" fontWeight={600}>
                        Sign In
                      </Link>
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      OR SIGN UP WITH
                    </Typography>
                  </Divider>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="inherit"
                        startIcon={<GoogleIcon />}
                        onClick={() => handleSocialRegister('Google')}
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
                        onClick={() => handleSocialRegister('GitHub')}
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
                        onClick={() => handleSocialRegister('Twitter')}
                        sx={{ 
                          borderRadius: 2,
                          py: 1,
                        }}
                      >
                        Twitter
                      </Button>
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Register; 