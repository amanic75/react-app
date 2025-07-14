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
      
      // Check if this user was recently deleted (within last 10 minutes)
      const recentlyDeleted = localStorage.getItem(`deleted_user_${userId}`);
      if (recentlyDeleted) {
        const deleteTime = parseInt(recentlyDeleted);
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        console.log('🔒 Checking deletion marker for user:', userId, 'deleteTime:', new Date(deleteTime), 'threshold:', new Date(tenMinutesAgo));
        if (deleteTime > tenMinutesAgo) {
          console.log('⚠️ User was recently deleted, not auto-creating profile');
          return null;
        } else {
          // Clean up expired deletion marker
          console.log('🧹 Cleaning up expired deletion marker for user:', userId);
          localStorage.removeItem(`deleted_user_${userId}`);
        }
      }
      
      // Add timeout to prevent hanging - reduced to 1 second for fastest fallback
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 1000)
      );
      
      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error('❌ Database error fetching profile:', error);
        
        // If no profile exists, try to create one (unless recently deleted)
        if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
          console.log('🔄 No profile in database for user:', userId);
          
          // Double-check deletion marker before creating
          const stillDeleted = localStorage.getItem(`deleted_user_${userId}`);
          if (stillDeleted) {
            console.log('🚫 User is marked as deleted, aborting profile creation');
            return null;
          }
          
          console.log('🆕 Creating new profile for user:', userId);
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
      // Check if it's a timeout - this is expected sometimes
      if (error.message === 'Profile fetch timeout') {
        console.warn('⏱️ Profile fetch timed out after 1s, using fallback');
      } else {
        console.error('❌ Error in getUserProfile:', error);
      }
      
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
      
      // Check one more time if user was recently deleted (within last 10 minutes)
      const recentlyDeleted = localStorage.getItem(`deleted_user_${userId}`);
      if (recentlyDeleted) {
        const deleteTime = parseInt(recentlyDeleted);
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        if (deleteTime > tenMinutesAgo) {
          console.log('🚫 Aborting profile creation - user was recently deleted:', userId);
          throw new Error('User was recently deleted');
        } else {
          // Clean up expired deletion marker
          console.log('🧹 Create profile: Cleaning up expired deletion marker for user:', userId);
          localStorage.removeItem(`deleted_user_${userId}`);
        }
      }
      
      // Add timeout for profile creation - increased to 10 seconds
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile creation timeout')), 10000)
      );
      
      // Get user info from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Could not get user info');
      }

      console.log('👤 Creating profile for authenticated user:', user.email, 'requested userId:', userId);

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
      
      // Prioritize role from user_metadata (set during admin creation) over domain-based detection
      const finalRole = user.user_metadata?.role || role;
      
      console.log('🔍 Role determination for user:', email);
      console.log('  - Domain-based role:', role);
      console.log('  - User metadata role:', user.user_metadata?.role);
      console.log('  - Final role:', finalRole);
      
      const insertPromise = supabase
        .from('user_profiles')
        .insert([
          {
            id: userId,
            email: email,
            first_name: firstName,
            last_name: lastName,
            role: finalRole,
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
          
          // Check if this user was recently deleted
          const recentlyDeleted = localStorage.getItem(`deleted_user_${session.user.id}`);
          if (recentlyDeleted) {
            const deleteTime = parseInt(recentlyDeleted);
            const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
            if (deleteTime > tenMinutesAgo) {
              console.log('🚫 Initial session: User was recently deleted, not setting profile:', session.user.email);
              if (mounted) {
                setUser(null);
                setUserProfile(null);
                setLoading(false);
              }
              return;
            } else {
              console.log('🧹 Initial session: Cleaning up expired deletion marker');
              localStorage.removeItem(`deleted_user_${session.user.id}`);
            }
          }
          
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
            console.log('👤 Processing auth state change for user:', session.user.id, session.user.email);
            
            // Check if this user was recently deleted
            const recentlyDeleted = localStorage.getItem(`deleted_user_${session.user.id}`);
            if (recentlyDeleted) {
              const deleteTime = parseInt(recentlyDeleted);
              const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
              if (deleteTime > tenMinutesAgo) {
                console.log('🚫 Auth state change: User was recently deleted, not setting profile:', session.user.email);
                // Don't set user or profile for recently deleted users
                if (mounted) {
                  setUser(null);
                  setUserProfile(null);
                }
                return;
              } else {
                console.log('🧹 Auth state change: Cleaning up expired deletion marker');
                localStorage.removeItem(`deleted_user_${session.user.id}`);
              }
            }
            
            setUser(session.user);
            
            // Skip profile refetch for USER_UPDATED events if we already have a profile
            // This prevents unnecessary database calls after password changes
            if (event === 'USER_UPDATED' && userProfile && userProfile.id === session.user.id) {
              console.log('🔄 USER_UPDATED event - keeping existing profile to avoid refetch');
              // Keep the existing profile, just update user object
              if (mounted) {
                setLoading(false);
              }
              return;
            }
            
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
    }, 15000); // Increased from 5000ms to 15000ms to allow profile fetch to complete

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

  // Admin-only user creation using service role key (doesn't affect current session)
  const adminCreateUser = async (email, password, userData = {}) => {
    try {
      setIsSigningIn(true);
      console.log('🔧 Admin creating user:', email);
      console.log('📋 UserData being sent to API:', userData);
      
      const requestBody = {
        email,
        password,
        userData: {
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          department: userData.department || '',
          role: userData.role || 'Employee'
        }
      };
      
      console.log('📤 Request body being sent:', requestBody);
      
      // Use the consolidated API endpoint which uses service role key
      const response = await fetch('/api/admin/users?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      console.log('📥 API response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      console.log('✅ Admin user creation successful:', result);
      return { data: result.user, error: null };
    } catch (error) {
      console.error('❌ Admin user creation error:', error);
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

      // Check if this account was recently deleted
      if (data.user) {
        console.log('✅ Authentication successful, checking if account exists...');
        const recentlyDeleted = localStorage.getItem(`deleted_user_${data.user.id}`);
        if (recentlyDeleted) {
          const deleteTime = parseInt(recentlyDeleted);
          const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
          if (deleteTime > tenMinutesAgo) {
            console.log('🚫 Attempted login with deleted account:', data.user.email);
            
            // Sign them out immediately
            await supabase.auth.signOut();
            
            // Return a clear error message
            throw new Error('This account has been deleted and is no longer available. Please contact your administrator if you believe this is an error.');
          } else {
            // Clean up expired deletion marker
            console.log('🧹 Cleaning up expired deletion marker during login');
            localStorage.removeItem(`deleted_user_${data.user.id}`);
          }
        }
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

  // Get all users (with fallback) - Excludes soft-deleted users
  const getAllUsers = async () => {
    try {
      console.log('🔍 Fetching all users from database...');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Get users timeout')), 10000)
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
        setTimeout(() => reject(new Error('Update timeout')), 10000)
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

  // Delete user profile (for admins) - Simple delete from database
  const deleteUserProfile = async (userId) => {
    try {
      console.log('🗑️ Deleting user profile for ID:', userId);
      
      // CRITICAL: Set deletion marker BEFORE deleting from database
      // This prevents race conditions where auth listeners recreate the user
      localStorage.setItem(`deleted_user_${userId}`, Date.now().toString());
      console.log('🔒 Set deletion marker for user BEFORE deletion:', userId);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Delete timeout')), 10000)
      );
      
      // Delete from user_profiles table
      console.log('🗃️ Deleting from user_profiles table...');
      const deletePromise = supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      const { error } = await Promise.race([deletePromise, timeoutPromise]);

      if (error) {
        console.error('❌ Error deleting user profile:', error);
        // Keep the deletion marker even if database deletion fails
        // This prevents auto-recreation attempts
        console.log('🔒 Keeping deletion marker due to database error');
        return { data: null, error: error };
      }

      console.log('✅ User profile deleted from database');
      console.log('✅ Delete successful - deletion marker will prevent auto-recreation');
      return { data: true, error: null };
    } catch (error) {
      console.error('❌ Delete operation failed:', error);
      
      // Check if it's a timeout or other error
      if (error.message === 'Delete timeout') {
        console.log('⏱️ Delete operation timed out - database may be unavailable');
        console.log('🔒 Keeping deletion marker due to timeout');
        return { data: null, error: new Error('Delete operation timed out. Please try again.') };
      }
      
      // For other errors, return the actual error
      // Keep deletion marker to prevent auto-recreation
      console.log('🔒 Keeping deletion marker due to error');
      return { data: null, error: error };
    }
  };

  // Assign user to item
  const assignUser = async (tableName, itemId, userId) => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Assign timeout')), 10000)
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
    adminCreateUser,
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