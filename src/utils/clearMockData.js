// Utility to clear all mock authentication data from localStorage
// This will remove any conflicting data that might interfere with Supabase authentication

export const clearAllMockData = () => {
  // console.log removed
  
  // List of all localStorage keys used by the mock system
  const mockDataKeys = [
    'capacity-auth',           // Mock auth state
    'capacity-users',          // Mock user data 
    'capacity-users-version',  // Mock user version
    'capacity-passwords',      // Mock saved passwords
    'capacity-login-activity', // Mock login activity
    'formulas_data',          // Mock formulas data
    'materials_data',         // Mock materials data
  ];
  
  // Clear each key
  mockDataKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      // console.log removed
    }
  });
  
  // Also clear any other keys that might start with 'capacity-'
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('capacity-') || key.includes('mock') || key.includes('demo')) {
      localStorage.removeItem(key);
      // console.log removed
    }
  });
  
  // Clear session storage as well
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('capacity-') || key.includes('mock') || key.includes('demo')) {
      sessionStorage.removeItem(key);
      // console.log removed
    }
  });
  
  // console.log removed
  // console.log removed
  
  return true;
};

// Make it available globally for easy access in browser console
if (typeof window !== 'undefined') {
  window.clearAllMockData = clearAllMockData;
}

// Auto-clear on import (you can comment this out if you want manual control)
clearAllMockData(); 