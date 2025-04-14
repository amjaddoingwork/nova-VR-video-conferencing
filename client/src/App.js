import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import theme from './theme';

// Layout components
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MeetingRoom from './pages/MeetingRoom';
import NotFound from './pages/NotFound';

// New Pages
import Features from './pages/Features';
import Product from './pages/Product';
import Download from './pages/Download';
import Updates from './pages/Updates';
import About from './pages/About';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import Press from './pages/Press';
import Help from './pages/Help';
import Community from './pages/Community';
import Developers from './pages/Developers';
import Partners from './pages/Partners';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Licenses from './pages/Licenses';

// Context
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="room/:roomId" element={<MeetingRoom />} />
              
              {/* New routes */}
              <Route path="features" element={<Features />} />
              <Route path="product" element={<Product />} />
              <Route path="download" element={<Download />} />
              <Route path="updates" element={<Updates />} />
              <Route path="about" element={<About />} />
              <Route path="careers" element={<Careers />} />
              <Route path="blog" element={<Blog />} />
              <Route path="press" element={<Press />} />
              <Route path="help" element={<Help />} />
              <Route path="community" element={<Community />} />
              <Route path="developers" element={<Developers />} />
              <Route path="partners" element={<Partners />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="terms" element={<Terms />} />
              <Route path="cookies" element={<Cookies />} />
              <Route path="licenses" element={<Licenses />} />
              
              <Route path="404" element={<NotFound />} />
              <Route path="*" element={<Navigate replace to="/404" />} />
            </Route>
          </Routes>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 