import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token and get user data
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      console.log('Fetching user data from API');
      const response = await axios.get(`${API_URL}/api/auth/me`);
      console.log('User data fetched successfully');
      setCurrentUser(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      // More detailed error messaging
      let errorMessage = 'Session expired. Please log in again.';
      if (err.response) {
        // Server responded with a status code outside of 2xx range
        if (err.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Server error (${err.response.status})`;
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
      // Clear invalid token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting login');
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token, user } = response.data;
      
      // Store token and set axios headers
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('Login successful');
      setCurrentUser(user);
      setError(null);
      return user;
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      const { token, user } = response.data;
      
      // Store token and set axios headers
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      setError(null);
      return user;
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Social login handling functions
  const googleLogin = async (googleResponse) => {
    try {
      setLoading(true);
      
      // Extract user profile from Google response
      const { profileObj, tokenId } = googleResponse;
      
      // Send to our backend API
      const response = await axios.post(`${API_URL}/api/auth/google`, {
        name: profileObj.name,
        email: profileObj.email,
        googleId: profileObj.googleId,
        token: tokenId
      });
      
      const { token, user } = response.data;
      
      // Store token and set axios headers
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      setError(null);
      return user;
    } catch (err) {
      let errorMessage = 'Google login failed. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const githubLogin = async (githubData) => {
    try {
      setLoading(true);
      
      // Send to our backend API
      const response = await axios.post(`${API_URL}/api/auth/github`, {
        name: githubData.name,
        email: githubData.email,
        githubId: githubData.id
      });
      
      const { token, user } = response.data;
      
      // Store token and set axios headers
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      setError(null);
      return user;
    } catch (err) {
      let errorMessage = 'GitHub login failed. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const twitterLogin = async (twitterData) => {
    try {
      setLoading(true);
      
      // Send to our backend API
      const response = await axios.post(`${API_URL}/api/auth/twitter`, {
        name: twitterData.name,
        email: twitterData.email,
        twitterId: twitterData.id
      });
      
      const { token, user } = response.data;
      
      // Store token and set axios headers
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user);
      setError(null);
      return user;
    } catch (err) {
      let errorMessage = 'Twitter login failed. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setError(null);
      return true;
    } catch (err) {
      let errorMessage = 'Password reset request failed. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/auth/reset-password/${token}`, { password });
      setError(null);
      return true;
    } catch (err) {
      let errorMessage = 'Password reset failed. Please try again.';
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    googleLogin,
    githubLogin,
    twitterLogin,
    forgotPassword,
    resetPassword,
    logout,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 