// Temporary authentication utilities to support guest login flow
const GUEST_TOKEN_KEY = 'guest_temporary_token';

// Generate a temporary guest token
export const generateGuestToken = (guestName) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const guestId = `guest-${randomId}`;
  
  // Create a simple object representing guest data
  const guestData = {
    id: guestId,
    name: guestName || `Guest-${randomId.substring(0, 4)}`,
    isGuest: true,
    created: timestamp
  };
  
  // Convert to string and base64 encode to mimic a JWT token
  const token = btoa(JSON.stringify(guestData));
  return { token, guestData };
};

// Store guest token in localStorage
export const storeGuestToken = (token) => {
  localStorage.setItem(GUEST_TOKEN_KEY, token);
};

// Get current guest data
export const getGuestData = () => {
  const token = localStorage.getItem(GUEST_TOKEN_KEY);
  if (!token) return null;
  
  try {
    return JSON.parse(atob(token));
  } catch (error) {
    console.error('Invalid guest token format', error);
    localStorage.removeItem(GUEST_TOKEN_KEY);
    return null;
  }
};

// Check if user is logged in as guest
export const isGuestUser = () => {
  return !!localStorage.getItem(GUEST_TOKEN_KEY);
};

// Clear guest session
export const clearGuestSession = () => {
  localStorage.removeItem(GUEST_TOKEN_KEY);
}; 