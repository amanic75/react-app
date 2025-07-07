import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Get user profile from database
  const getUserProfile = async (userId) => {
    try {
      console.log('🔍 Fetching user profile for ID:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        console.error('❌ Error details:', error.message, error.code);
        return null;
      }
      
      console.log('✅ User profile found:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in getUserProfile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Session found for user:', session.user.email);
          setUser(session.user);
          const profile = await getUserProfile(session.user.id);
          if (mounted) {
            setUserProfile(profile);
          }
        } else {
          console.log('ℹ️ No active session found');
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          console.log('✅ Initial auth check complete');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');

        if (session?.user) {
          setUser(session.user);
          const profile = await getUserProfile(session.user.id);
          if (mounted) {
            setUserProfile(profile);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) {
        console.log('⚠️ Auth timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, userData = {}) => {
    try {
      setIsSigningIn(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName || '',
            last_name: userData.lastName || '',
            department: userData.department || '',
            role: userData.role || 'Employee'
          }
        }
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setIsSigningIn(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  };

  // Change password
  const changePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Change password error:', error);
      return { data: null, error };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  };

  // Get all users (for admins)
  const getAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Get all users error:', error);
      return { data: null, error };
    }
  };

  // Update user profile (for admins)
  const updateUserProfile = async (userId, updates) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          first_name: updates.first_name,
          last_name: updates.last_name,
          role: updates.role,
          department: updates.department,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { data: null, error };
    }
  };

  // Delete user profile (for admins)
  const deleteUserProfile = async (userId) => {
    try {
      // Note: This will only delete from user_profiles, not from auth.users
      // For complete user deletion, you'd need to use Supabase Admin API
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Delete user profile error:', error);
      return { data: null, error };
    }
  };

  // Assign user to item
  const assignUser = async (tableName, itemId, userId) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .update({ assigned_to: userId })
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Assign user error:', error);
      return { data: null, error };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isSigningIn,
    signUp,
    signIn,
    signOut,
    updateProfile,
    changePassword,
    resetPassword,
    getAllUsers,
    updateUserProfile,
    deleteUserProfile,
    assignUser,
    // Helper functions
    isAuthenticated: !!user,
    isCapacityAdmin: userProfile?.role === 'Capacity Admin',
    isNSightAdmin: userProfile?.role === 'NSight Admin',
    isEmployee: userProfile?.role === 'Employee',
    // Get dashboard route based on role
    getDashboardRoute: () => {
      if (!userProfile) return '/dashboard';
      switch (userProfile.role) {
        case 'Capacity Admin':
          return '/dashboard'; // AdminDashboard
        case 'NSight Admin':
          return '/dashboard'; // NsightAdminDashboard  
        case 'Employee':
          return '/dashboard'; // EmployeeDashboard
        default:
          return '/dashboard';
      }
    },
    canEdit: (item) => {
      if (!user || !userProfile) return false;
      if (userProfile.role === 'Capacity Admin') return true;
      if (userProfile.role === 'NSight Admin') return true;
      return item?.created_by === user.id || item?.assigned_to === user.id;
    },
    canDelete: (item) => {
      if (!user || !userProfile) return false;
      if (userProfile.role === 'Capacity Admin') return true;
      return item?.created_by === user.id;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 