import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
// Removed: import { recordActivity, ACTIVITY_TYPES } from '../lib/loginActivity';

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
    
    // Always default to Employee role - ignore session metadata role
    // This prevents the brief Admin Dashboard flash for @capacity.com users
    const role = 'Employee';
    
    return {
      id: authUser.id,
      email: email,
      first_name: authUser.user_metadata?.first_name || emailName,
      last_name: authUser.user_metadata?.last_name || '',
      role: role, // Always use Employee role, never fall back to session metadata
      department: authUser.user_metadata?.department || '',
      app_access: authUser.user_metadata?.app_access || [],
      created_at: authUser.created_at,
      updated_at: authUser.updated_at || new Date().toISOString()
    };
  };

  // Get user profile from database with fallback
  const getUserProfile = async (userId, fallbackUser = null) => {
    try {

      
      // Check if this user was recently deleted (within last 10 minutes)
      const recentlyDeleted = localStorage.getItem(`deleted_user_${userId}`);
      if (recentlyDeleted) {
        const deleteTime = parseInt(recentlyDeleted);
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        // console.log removed
        if (deleteTime > tenMinutesAgo) {
          // console.log removed
          return null;
        } else {
          // Clean up expired deletion marker
          // console.log removed
          localStorage.removeItem(`deleted_user_${userId}`);
        }
      }
      
      // Add timeout to prevent hanging - increased to 3 seconds to allow database to respond
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      );
      
      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        // console.error removed
        
        // If no profile exists, try to create one (unless recently deleted)
        if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
          // console.log removed
          
          // Double-check deletion marker before creating
          const stillDeleted = localStorage.getItem(`deleted_user_${userId}`);
          if (stillDeleted) {
            // console.log removed
            return null;
          }
          
          // console.log removed
          try {
            return await createUserProfile(userId);
          } catch (createError) {
            // console.error removed
            // console.log removed
            
            // Use fallbackUser if provided, otherwise try to get user
            if (fallbackUser) {
              return createProfileFromAuth(fallbackUser);
            }
            
            const { data: { user } } = await supabase.auth.getUser();
            return createProfileFromAuth(user);
          }
        }
        
        // For other errors, fall back to auth-based profile
        // console.log removed
        
        // Use fallbackUser if provided, otherwise try to get user
        if (fallbackUser) {
          return createProfileFromAuth(fallbackUser);
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        return createProfileFromAuth(user);
      }
      

      return data;
    } catch (error) {
      // Check if it's a timeout - this is expected sometimes
      if (error.message === 'Profile fetch timeout') {
        // console.warn removed
      } else {
        // console.error removed
      }
      
      // Always fall back to auth-based profile
      // console.log removed
      try {
        // Use fallbackUser if provided, otherwise try to get user
        if (fallbackUser) {
          return createProfileFromAuth(fallbackUser);
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        return createProfileFromAuth(user);
      } catch (authError) {
        // console.error removed
        return null;
      }
    }
  };

  // Auto-link user to company if they are a company admin
  const autoLinkToCompany = async (userProfile) => {
    try {
      // console.log removed
      
      // Find any company where this user is the admin
      const response = await fetch('/api/admin/companies');
      if (!response.ok) {
        // console.log removed
        return;
      }
      
      const { companies } = await response.json();
      const matchingCompany = companies.find(company => 
        company.adminUserEmail === userProfile.email
      );
      
      if (!matchingCompany) {
        // console.log removed
        return;
      }
      
      // console.log removed
      
      // Check if link already exists
      const { data: existingLink, error: linkError } = await supabase
        .from('company_users')
        .select('id')
        .eq('company_id', matchingCompany.id)
        .eq('user_id', userProfile.id)
        .single();
      
      if (existingLink) {
        // console.log removed
        return;
      }
      
      // Create the missing link
      const { error: insertError } = await supabase
        .from('company_users')
        .insert({
          company_id: matchingCompany.id,
          user_id: userProfile.id,
          role: 'Admin',
          status: 'Active',
          added_at: new Date().toISOString()
        });
      
      if (insertError) {
        // console.error removed
      } else {
        // console.log removed
      }
      
    } catch (error) {
      // console.error removed
      // Don't throw - this is a bonus feature, not critical
    }
  };

  // Create user profile in database with fallback
  const createUserProfile = async (userId) => {
    try {
      // console.log removed
      
      // Check one more time if user was recently deleted (within last 10 minutes)
      const recentlyDeleted = localStorage.getItem(`deleted_user_${userId}`);
      if (recentlyDeleted) {
        const deleteTime = parseInt(recentlyDeleted);
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        if (deleteTime > tenMinutesAgo) {
          // console.log removed
          throw new Error('User was recently deleted');
        } else {
          // Clean up expired deletion marker
          // console.log removed
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

      // console.log removed

      // Extract name from email if no metadata exists
      const email = user.email;
      const emailName = email.split('@')[0];
      const firstName = user.user_metadata?.first_name || emailName;
      const lastName = user.user_metadata?.last_name || '';
      
      // Default to Employee role - let database determine actual role
      const role = 'Employee';
      
      // Prioritize role from user_metadata (set during admin creation) over domain-based detection
      const finalRole = user.user_metadata?.role || role;
      
      // console.log removed
      // console.log removed
      // console.log removed
      // console.log removed
      
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
        // console.error removed
        throw error;
      }

      // console.log removed
      
      // CRITICAL: Auto-link to company if this user is a company admin
      await autoLinkToCompany(data);
      
      return data;
    } catch (error) {
      // console.error removed
      throw error; // Let caller handle fallback
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        // console.log removed
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          // console.error removed
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          
          // Check if this user was recently deleted
          const recentlyDeleted = localStorage.getItem(`deleted_user_${session.user.id}`);
          if (recentlyDeleted) {
            const deleteTime = parseInt(recentlyDeleted);
            const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
            if (deleteTime > tenMinutesAgo) {
              // console.log removed
              if (mounted) {
                setUser(null);
                setUserProfile(null);
                setLoading(false);
              }
              return;
            } else {
              // console.log removed
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
            // console.error removed
            // Final fallback to auth data using session user
            if (mounted) {
              const fallbackProfile = createProfileFromAuth(session.user);
              setUserProfile(fallbackProfile);
            }
          }
        } else {
          // console.log removed
          if (mounted) {
            setUser(null);
            setUserProfile(null);
          }
        }
      } catch (error) {
        // console.error removed
        if (mounted) {
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        if (mounted) {
  
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          if (session?.user) {
            
            // Check if this user was recently deleted
            const recentlyDeleted = localStorage.getItem(`deleted_user_${session.user.id}`);
            if (recentlyDeleted) {
              const deleteTime = parseInt(recentlyDeleted);
              const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
              if (deleteTime > tenMinutesAgo) {
                // console.log removed
                // Don't set user or profile for recently deleted users
                if (mounted) {
                  setUser(null);
                  setUserProfile(null);
                }
                return;
              } else {
                // console.log removed
                localStorage.removeItem(`deleted_user_${session.user.id}`);
              }
            }
            
            setUser(session.user);
            
            // Skip profile refetch for USER_UPDATED events if we already have a profile
            // This prevents unnecessary database calls after password changes
            if (event === 'USER_UPDATED' && userProfile && userProfile.id === session.user.id) {
              // console.log removed
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
          // console.error removed
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
        // console.log removed
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
      // console.error removed
      return { data: null, error };
    } finally {
      setIsSigningIn(false);
    }
  };

  // Admin-only user creation using service role key (doesn't affect current session)
  const adminCreateUser = async (email, password, userData = {}) => {
    try {
      setIsSigningIn(true);
      // console.log removed
      // console.log removed
      
      const requestBody = {
        email,
        password,
        userData: {
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          department: userData.department || '',
          role: userData.role || 'Employee',
          app_access: userData.appAccess || []
        }
      };
      
      // console.log removed
      
      // Use the consolidated API endpoint which uses service role key
      const response = await fetch('/api/admin/users?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      
      // console.log removed

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      // console.log removed
      return { data: result.user, error: null };
    } catch (error) {
      // console.error removed
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
        // console.log removed
        const recentlyDeleted = localStorage.getItem(`deleted_user_${data.user.id}`);
        if (recentlyDeleted) {
          const deleteTime = parseInt(recentlyDeleted);
          const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
          if (deleteTime > tenMinutesAgo) {
            // console.log removed
            
            // Sign them out immediately
            await supabase.auth.signOut();
            
            // Return a clear error message
            throw new Error('This account has been deleted and is no longer available. Please contact your administrator if you believe this is an error.');
          } else {
            // Clean up expired deletion marker
            // console.log removed
            localStorage.removeItem(`deleted_user_${data.user.id}`);
          }
        }

        // Record successful login activity (both localStorage and database)
        const profile = await getUserProfile(data.user.id, data.user);
        const userData = {
          name: profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : data.user.email.split('@')[0],
          role: profile?.role || 'Employee'
        };

        // Store in localStorage for immediate UI updates
        // recordActivity(ACTIVITY_TYPES.LOGIN, data.user.email, userData);
        
        // Store in database for persistence and cross-session tracking
        try {
          const apiUrl = import.meta.env.DEV || window.location.hostname === 'localhost'
            ? 'http://localhost:3001/api/login-events'
            : '/api/login-events';

          await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: data.user.email,
              userName: userData.name,
              userRole: userData.role,
              eventType: 'login'
            })
          });
          // console.log removed
        } catch (dbError) {
          // console.warn removed
        }
        
        // console.log removed
      }

      return { data, error: null };
    } catch (error) {
      // console.error removed
      return { data: null, error };
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Record logout activity before signing out (both localStorage and database)
      if (user && userProfile) {
        const userData = {
          name: userProfile.first_name && userProfile.last_name 
            ? `${userProfile.first_name} ${userProfile.last_name}` 
            : user.email.split('@')[0],
          role: userProfile.role || 'Employee'
        };

        // Store in localStorage for immediate UI updates
        // recordActivity(ACTIVITY_TYPES.LOGOUT, user.email, userData);
        
        // Store in database for persistence and cross-session tracking
        try {
          const apiUrl = import.meta.env.DEV || window.location.hostname === 'localhost'
            ? 'http://localhost:3001/api/login-events'
            : '/api/login-events';

          await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userEmail: user.email,
              userName: userData.name,
              userRole: userData.role,
              eventType: 'logout'
            })
          });
          // console.log removed
        } catch (dbError) {
          // console.warn removed
        }
        
        // console.log removed
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        // If session is already missing, treat as successful logout
        if (error.message?.includes('Auth session missing') || 
            error.name === 'AuthSessionMissingError') {
          // console.log removed
        } else {
          throw error;
        }
      }
    } catch (error) {
      // console.error removed
      
      // If it's a session missing error, don't throw - just clear state
      if (error.message?.includes('Auth session missing') || 
          error.name === 'AuthSessionMissingError') {
        // console.log removed
      } else {
        // For other errors, still clear state but re-throw
        setUser(null);
        setUserProfile(null);
        throw error;
      }
    } finally {
      // Always clear local state regardless of Supabase response
      // console.log removed
      setUser(null);
      setUserProfile(null);
      
      // Always redirect to auth page after logout
      // This ensures users are properly redirected regardless of current page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
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
        // console.error removed
        
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
      // console.error removed
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
      // console.error removed
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
      // console.error removed
      return { data: null, error };
    }
  };

  // Get all users (with fallback) - Excludes soft-deleted users
  const getAllUsers = async () => {
    try {
      // console.log removed
      
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

      // console.log removed
      return { data, error: null };
    } catch (error) {
      // console.error removed
      // console.log removed
      return { 
        data: userProfile ? [userProfile] : [], 
        error: null 
      };
    }
  };

  // Get users filtered by company (for multi-tenant isolation)
  const getCompanyUsers = async (companyId) => {
    try {

      
      if (!companyId) {
        // console.warn removed
        return { data: [], error: null };
      }
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Get company users timeout')), 10000)
      );
      
      // First get the company_users associations
      const fetchPromise = supabase
        .from('company_users')
        .select(`
          user_id,
          role,
          status,
          added_at
        `)
        .eq('company_id', companyId)
        .order('added_at', { ascending: false });

      const { data: companyUsersData, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        throw error;
      }

      if (!companyUsersData || companyUsersData.length === 0) {
        // console.log removed
        return { data: [], error: null };
      }

      // Get the user IDs
      const userIds = companyUsersData.map(cu => cu.user_id);
      
      // Now fetch the user profiles for these user IDs
      const { data: userProfiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', userIds);

      if (profileError) {
        throw profileError;
      }

      // Combine the data
      const users = userProfiles.map(profile => {
        const companyUser = companyUsersData.find(cu => cu.user_id === profile.id);
        return {
          ...profile,
          company_role: companyUser?.role || 'Employee',  // Role within this company
          company_status: companyUser?.status || 'Active'  // Status within this company
        };
      });


      return { data: users, error: null };
    } catch (error) {
      // console.error removed
      return { 
        data: [], 
        error 
      };
    }
  };

  // Update user profile (for admins)
  const updateUserProfile = async (userId, updates) => {
    try {
      // console.log removed
      
      // Use the backend API that has proper admin permissions
      const response = await fetch('/api/admin/users?action=update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates
        })
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Failed to update user profile');
      }

      const result = await response.json();
      // console.log removed
      return { data: result.user, error: null };
    } catch (error) {
      // console.error removed
      return { data: null, error };
    }
  };

  // Delete user profile (for admins) - Simple delete from database
  const deleteUserProfile = async (userId) => {
    try {
      // console.log removed
      
      // CRITICAL: Set deletion marker BEFORE deleting from database
      // This prevents race conditions where auth listeners recreate the user
      localStorage.setItem(`deleted_user_${userId}`, Date.now().toString());
      // console.log removed
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Delete timeout')), 10000)
      );
      
      // Delete from user_profiles table
      // console.log removed
      const deletePromise = supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      const { error } = await Promise.race([deletePromise, timeoutPromise]);

      if (error) {
        // console.error removed
        // Keep the deletion marker even if database deletion fails
        // This prevents auto-recreation attempts
        // console.log removed
        return { data: null, error: error };
      }

      // console.log removed
      // console.log removed
      return { data: true, error: null };
    } catch (error) {
      // console.error removed
      
      // Check if it's a timeout or other error
      if (error.message === 'Delete timeout') {
        // console.log removed
        // console.log removed
        return { data: null, error: new Error('Delete operation timed out. Please try again.') };
      }
      
      // For other errors, return the actual error
      // Keep deletion marker to prevent auto-recreation
      // console.log removed
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
      // console.error removed
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
    getCompanyUsers,
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
      // Handle both single UUID and array formats for assigned_to
      const isAssignedTo = Array.isArray(item?.assigned_to) 
        ? item.assigned_to.includes(user.id)
        : item?.assigned_to === user.id;
      return item?.created_by === user.id || isAssignedTo;
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