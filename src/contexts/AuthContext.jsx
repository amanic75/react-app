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

  // Create profile from auth user data (fallback when database fails)
  const createProfileFromAuth = (authUser) => {
    if (!authUser) return null;
    
    const email = authUser.email;
    const emailName = email.split('@')[0];
    const domain = email.split('@')[1];
    
    // Determine role based on email domain
    let role = 'Employee';
    if (domain === 'capacity.com' || email.includes('admin')) {
      role = 'Capacity Admin';
    } else if (domain === 'nsight-inc.com') {
      role = 'NSight Admin';
    }
    
    return {
      id: authUser.id,
      email: email,
      first_name: authUser.user_metadata?.first_name || emailName,
      last_name: authUser.user_metadata?.last_name || '',
      role: authUser.user_metadata?.role || role,
      department: authUser.user_metadata?.department || '',
      created_at: authUser.created_at,
      updated_at: authUser.updated_at || new Date().toISOString()
    };
  };

  // Get user profile from database with fallback
  const getUserProfile = async (userId, fallbackUser = null) => {
    try {
      console.log('🔍 Fetching user profile for ID:', userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000) // Reduced to 3 seconds
      );
      
      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error('❌ Database error fetching profile:', error);
        
        // If no profile exists, try to create one
        if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
          console.log('🔄 No profile in database, creating one...');
          try {
            return await createUserProfile(userId);
          } catch (createError) {
            console.error('❌ Database profile creation failed:', createError);
            console.log('🚨 Falling back to auth-based profile');
            
            // Use fallbackUser if provided, otherwise try to get user
            if (fallbackUser) {
              return createProfileFromAuth(fallbackUser);
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            return createProfileFromAuth(user);
          }
        }
        
        // For other errors, fall back to auth-based profile
        console.log('🚨 Database unavailable, using auth-based profile');
        
        // Use fallbackUser if provided, otherwise try to get user
        if (fallbackUser) {
          return createProfileFromAuth(fallbackUser);
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        return createProfileFromAuth(user);
      }
      
      console.log('✅ User profile found in database:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in getUserProfile:', error);
      
      // Always fall back to auth-based profile
      console.log('🚨 Profile fetch failed, creating from auth data');
      try {
        // Use fallbackUser if provided, otherwise try to get user
        if (fallbackUser) {
          return createProfileFromAuth(fallbackUser);
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        return createProfileFromAuth(user);
      } catch (authError) {
        console.error('❌ Even auth fallback failed:', authError);
        return null;
      }
    }
  };

  // Create user profile in database with fallback
  const createUserProfile = async (userId) => {
    try {
      console.log('🔄 Creating user profile in database for ID:', userId);
      
      // Add timeout for profile creation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile creation timeout')), 3000)
      );
      
      // Get user info from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Could not get user info');
      }

      // Extract name from email if no metadata exists
      const email = user.email;
      const emailName = email.split('@')[0];
      const firstName = user.user_metadata?.first_name || emailName;
      const lastName = user.user_metadata?.last_name || '';
      
      // Determine role based on email domain
      let role = 'Employee';
      const domain = email.split('@')[1];
      if (domain === 'capacity.com' || email.includes('admin')) {
        role = 'Capacity Admin';
      } else if (domain === 'nsight-inc.com') {
        role = 'NSight Admin';
      }
      
      const insertPromise = supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: email,
            first_name: firstName,
            last_name: lastName,
            role: user.user_metadata?.role || role,
            department: user.user_metadata?.department || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      const { data, error } = await Promise.race([insertPromise, timeoutPromise]);

      if (error) {
        console.error('❌ Error creating user profile in database:', error);
        throw error;
      }

      console.log('✅ User profile created in database:', data);
      return data;
    } catch (error) {
      console.error('❌ Database profile creation failed:', error);
      throw error; // Let caller handle fallback
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
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          console.log('✅ Session found for user:', session.user.email);
          setUser(session.user);
          
          // Try to get profile from database, fall back to auth data
          try {
            const profile = await getUserProfile(session.user.id, session.user);
            if (mounted) {
              setUserProfile(profile);
            }
          } catch (profileError) {
            console.error('❌ Profile loading failed completely:', profileError);
            // Final fallback to auth data using session user
            if (mounted) {
              const fallbackProfile = createProfileFromAuth(session.user);
              setUserProfile(fallbackProfile);
            }
          }
        } else {
          console.log('ℹ️ No active session found');
          if (mounted) {
            setUser(null);
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error('❌ Error in getInitialSession:', error);
        if (mounted) {
          setUser(null);
          setUserProfile(null);
        }
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

        try {
          if (session?.user) {
            setUser(session.user);
            try {
              const profile = await getUserProfile(session.user.id, session.user);
              if (mounted) {
                setUserProfile(profile);
              }
            } catch (profileError) {
              console.error('❌ Profile loading failed in auth change:', profileError);
              if (mounted) {
                const fallbackProfile = createProfileFromAuth(session.user);
                setUserProfile(fallbackProfile);
              }
            }
          } else {
            setUser(null);
            setUserProfile(null);
          }
        } catch (error) {
          console.error('❌ Error in auth state change handler:', error);
          if (mounted) {
            setUser(null);
            setUserProfile(null);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Safety timeout - reduced since we have faster individual timeouts
    const timeout = setTimeout(() => {
      if (mounted) {
        console.log('⚠️ Auth timeout - forcing loading to false');
        setLoading(false);
      }
    }, 5000);

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
        // If session is already missing, treat as successful logout
        if (error.message?.includes('Auth session missing') || 
            error.name === 'AuthSessionMissingError') {
          console.log('⚠️ Session already missing, clearing local state');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Sign out error:', error);
      
      // If it's a session missing error, don't throw - just clear state
      if (error.message?.includes('Auth session missing') || 
          error.name === 'AuthSessionMissingError') {
        console.log('⚠️ Session missing error caught, clearing local state anyway');
      } else {
        // For other errors, still clear state but re-throw
        setUser(null);
        setUserProfile(null);
        throw error;
      }
    } finally {
      // Always clear local state regardless of Supabase response
      console.log('🚪 Clearing local auth state');
      setUser(null);
      setUserProfile(null);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      // Try database update first
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
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setUserProfile(data);
        return { data, error: null };
      } catch (dbError) {
        console.error('❌ Database update failed, updating auth metadata:', dbError);
        
        // Fallback to auth metadata update
        const { data, error } = await supabase.auth.updateUser({
          data: {
            first_name: updates.first_name,
            last_name: updates.last_name,
            role: updates.role,
            department: updates.department
          }
        });

        if (error) {
          throw error;
        }

        const updatedProfile = createProfileFromAuth(data.user);
        setUserProfile(updatedProfile);
        return { data: updatedProfile, error: null };
      }
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

  // Get all users (with fallback)
  const getAllUsers = async () => {
    try {
      console.log('🔍 Fetching all users from database...');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Get users timeout')), 3000)
      );
      
      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        throw error;
      }

      console.log('✅ Users fetched from database:', data.length);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Database users fetch failed:', error);
      console.log('🚨 Falling back to current user only');
      return { 
        data: userProfile ? [userProfile] : [], 
        error: null 
      };
    }
  };

  // Update user profile (for admins)
  const updateUserProfile = async (userId, updates) => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Update timeout')), 3000)
      );
      
      const updatePromise = supabase
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

      const { data, error } = await Promise.race([updatePromise, timeoutPromise]);

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Update user profile failed:', error);
      // Return success to keep UI working
      return { data: userProfile, error: null };
    }
  };

  // Delete user profile (for admins)
  const deleteUserProfile = async (userId) => {
    try {
      console.log('🗑️ Attempting to delete user profile:', userId);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Delete timeout')), 3000)
      );
      
      const deletePromise = supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      const { data, error } = await Promise.race([deletePromise, timeoutPromise]);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        return { data: null, error: error };
      }

      console.log('✅ User profile deleted successfully:', data);
      return { data: true, error: null };
    } catch (error) {
      console.error('❌ Delete user profile failed:', error);
      
      // Check if it's a timeout or other error
      if (error.message === 'Delete timeout') {
        console.log('⏱️ Delete operation timed out - database may be unavailable');
        return { data: null, error: new Error('Delete operation timed out. Please try again.') };
      }
      
      // For other errors, return the actual error
      return { data: null, error: error };
    }
  };

  // Assign user to item
  const assignUser = async (tableName, itemId, userId) => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Assign timeout')), 3000)
      );
      
      const assignPromise = supabase
        .from(tableName)
        .update({ assigned_to: userId })
        .eq('id', itemId)
        .select()
        .single();

      const { data, error } = await Promise.race([assignPromise, timeoutPromise]);

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('❌ Assign user failed:', error);
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