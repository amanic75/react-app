import React, { createContext, useContext, useState, useEffect } from 'react';
import { addUser, getUsers } from './data';
import { recordActivity, ACTIVITY_TYPES } from './loginActivity';

// Function to generate authentication credentials from user database
const generateAuthCredentials = () => {
  const users = getUsers();
  const credentials = {};
  
  console.log('Generating auth credentials for', users.length, 'users');
  
  // Convert role to auth role format
  const roleMapping = {
    'Employee': 'employee',
    'Admin': 'admin', 
    'NSight Admin': 'nsight-admin'
  };
  
  // Load saved passwords from localStorage
  const savedPasswords = localStorage.getItem('capacity-passwords');
  const customPasswords = savedPasswords ? JSON.parse(savedPasswords) : {};

  // Generate credentials for all users
  users.forEach(user => {
    credentials[user.email] = {
      password: customPasswords[user.email] || 'password', // Use saved password or default
      role: roleMapping[user.role] || 'employee',
      userData: user // Store full user data for dashboard personalization
    };
  });
  
  // Log demo accounts specifically
  const demoEmails = ['capacity@capacity.com', 'nsight@nsight-inc.com', 'employee@domain.com'];
  demoEmails.forEach(email => {
    if (credentials[email]) {
      console.log(`Demo account found: ${email} -> ${credentials[email].role}`);
    } else {
      console.log(`Demo account MISSING: ${email}`);
    }
  });
  
  return credentials;
};

// Mock user credentials - now dynamically generated
let MOCK_CREDENTIALS = generateAuthCredentials();

// Function to refresh credentials when user data changes
const refreshCredentials = () => {
  MOCK_CREDENTIALS = generateAuthCredentials();
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper functions for persistent login
const saveAuthState = (user, role, userData, keepSignedIn = true) => {
  const authData = { user, role, userData };
  if (keepSignedIn) {
    localStorage.setItem('capacity-auth', JSON.stringify(authData));
  } else {
    sessionStorage.setItem('capacity-auth', JSON.stringify(authData));
  }
};

const loadAuthState = () => {
  // Check localStorage first (persistent), then sessionStorage
  const persistent = localStorage.getItem('capacity-auth');
  const session = sessionStorage.getItem('capacity-auth');
  
  if (persistent) {
    return JSON.parse(persistent);
  } else if (session) {
    return JSON.parse(session);
  }
  
  return null;
};

const clearAuthState = () => {
  localStorage.removeItem('capacity-auth');
  sessionStorage.removeItem('capacity-auth');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved auth state on app start
  useEffect(() => {
    const savedAuth = loadAuthState();
    if (savedAuth) {
      console.log('Restoring auth state from storage:', savedAuth.user);
      setUser(savedAuth.user);
      setRole(savedAuth.role);
      setUserData(savedAuth.userData);
    }
    setIsLoading(false);
  }, []);

  // Refresh credentials when component mounts and periodically
  useEffect(() => {
    refreshCredentials();
    
    // Refresh credentials every 5 seconds to stay in sync with user management
    const interval = setInterval(refreshCredentials, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const login = (email, password, keepSignedIn = true) => {
    // Refresh credentials to get latest user data
    refreshCredentials();
    
    console.log('Login attempt:', email);
    console.log('Available credentials:', Object.keys(MOCK_CREDENTIALS).length);
    
    const credential = MOCK_CREDENTIALS[email];
    
    if (credential) {
      console.log('Found credential for:', email, 'role:', credential.role);
      if (credential.password === password) {
        console.log('Password match, logging in');
        setUser(email);
        setRole(credential.role);
        setUserData(credential.userData);
        saveAuthState(email, credential.role, credential.userData, keepSignedIn);
        
        // Record login activity
        recordActivity(ACTIVITY_TYPES.LOGIN, email, credential.userData);
        
        return { success: true };
      } else {
        console.log('Password mismatch');
        return { success: false, error: 'Invalid credentials' };
      }
    } else {
      console.log('No credential found for:', email);
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const logout = () => {
    // Record logout activity before clearing state
    if (user && userData) {
      recordActivity(ACTIVITY_TYPES.LOGOUT, user, userData);
    }
    
    setUser(null);
    setRole(null);
    setUserData(null);
    clearAuthState();
  };

  const createAccount = (userData) => {
    const { email, firstName, lastName, password, role } = userData;
    
    // Refresh credentials to check current state
    refreshCredentials();
    
    // Check if email already exists
    if (MOCK_CREDENTIALS[email]) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Add to user management data
    const roleMap = {
      'admin': 'Capacity Admin',
      'nsight-admin': 'NSight Admin',
      'employee': 'Employee'
    };

    const newUser = {
      id: Date.now(), // Simple ID generation
      name: `${firstName} ${lastName}`,
      email,
      role: roleMap[role] || 'Employee',
      status: 'Active',
      lastLogin: 'Never',
      contact: '',
      appAccess: roleMap[role] === 'Capacity Admin' ? ['formulas', 'suppliers', 'raw-materials'] : roleMap[role] === 'NSight Admin' ? ['developer-mode', 'existing-company-mode'] : ['formulas'],
      credentials: roleMap[role] === 'Capacity Admin' ? 'admin/secure pass' : roleMap[role] === 'NSight Admin' ? 'nsight-admin/enterprise pass' : 'user/temporary pass'
    };

    addUser(newUser);
    
    // Refresh credentials to include the new user
    refreshCredentials();

    return { success: true };
  };

  const changePassword = ({ email, oldPassword, newPassword, isAdminReset = false }) => {
    console.log('Change password attempt for:', email, isAdminReset ? '(admin reset)' : '');
    
    // Refresh credentials to get latest data
    refreshCredentials();
    
    const credential = MOCK_CREDENTIALS[email];
    
    if (!credential) {
      return { success: false, error: 'User not found' };
    }
    
    // Only verify old password if not an admin reset
    if (!isAdminReset && credential.password !== oldPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Store new password in localStorage for persistence
    const savedPasswords = localStorage.getItem('capacity-passwords');
    const passwords = savedPasswords ? JSON.parse(savedPasswords) : {};
    passwords[email] = newPassword;
    localStorage.setItem('capacity-passwords', JSON.stringify(passwords));
    
    // Update the in-memory credentials
    MOCK_CREDENTIALS[email].password = newPassword;
    
    console.log('Password changed successfully for:', email);
    return { success: true };
  };

  const value = {
    user,
    role,
    userData,
    login,
    logout,
    createAccount,
    changePassword,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 