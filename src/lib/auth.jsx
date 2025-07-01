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
  
  // Generate credentials for all users with password "password"
  users.forEach(user => {
    credentials[user.email] = {
      password: 'password',
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
const saveAuthState = (user, role, userData, keepSignedIn) => {
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

  // Load saved auth state on app start
  useEffect(() => {
    const savedAuth = loadAuthState();
    if (savedAuth) {
      setUser(savedAuth.user);
      setRole(savedAuth.role);
      setUserData(savedAuth.userData);
    }
  }, []);

  // Refresh credentials when component mounts and periodically
  useEffect(() => {
    refreshCredentials();
    
    // Refresh credentials every 5 seconds to stay in sync with user management
    const interval = setInterval(refreshCredentials, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const login = (email, password, keepSignedIn = false) => {
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
      'admin': 'Admin',
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
      appAccess: role === 'admin' || role === 'nsight-admin' ? ['formulas', 'suppliers', 'raw-materials'] : ['formulas'],
      credentials: role === 'admin' ? 'admin/secure pass' : role === 'nsight-admin' ? 'nsight-admin/enterprise pass' : 'user/temporary pass'
    };

    addUser(newUser);
    
    // Refresh credentials to include the new user
    refreshCredentials();

    return { success: true };
  };

  const value = {
    user,
    role,
    userData,
    login,
    logout,
    createAccount,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 