import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  isCompanyAdmin, 
  isGlobalAdmin, 
  isAnyAdmin, 
  getDefaultAppAccess, 
  getCompanyAdminRoleFromDomain,
  GLOBAL_ADMIN_ROLE,
  EMPLOYEE_ROLE 
} from '../lib/roleUtils';

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
    
    // Determine role based on email domain or user metadata
    let role = EMPLOYEE_ROLE; // Default role
    
    // Check user metadata first (set during admin creation)
    if (authUser.user_metadata?.role) {
      role = authUser.user_metadata.role;
    }
    // Check if user has admin in their name or email domain suggests admin role
    else if (emailName.toLowerCase().includes('admin') || domain.includes('admin')) {
      // Use dynamic role detection that can handle any company
      const detectedRole = getCompanyAdminRoleFromDomain(domain);
      if (detectedRole && detectedRole !== GLOBAL_ADMIN_ROLE) {
        role = detectedRole;
      } else if (detectedRole === GLOBAL_ADMIN_ROLE) {
        role = GLOBAL_ADMIN_ROLE;
      } else {
        // Fallback for admin emails without clear company mapping
        role = getCompanyAdminRoleFromDomain(domain) || EMPLOYEE_ROLE;
      }
    }
    // Check for known admin domains (even without 'admin' in email name)
    else {
      const detectedRole = getCompanyAdminRoleFromDomain(domain);
      if (detectedRole === GLOBAL_ADMIN_ROLE) {
        role = GLOBAL_ADMIN_ROLE;
      }
      // Don't auto-assign company admin roles unless email indicates admin
    }
    
    // Set app access based on role using utility function
    const appAccess = getDefaultAppAccess(role);

    return {
      id: authUser.id,
      email: email,
      first_name: authUser.user_metadata?.first_name || emailName,
      last_name: authUser.user_metadata?.last_name || '',
      role: role,
      company_id: null,
      app_access: appAccess,
      created_at: authUser.created_at,
      updated_at: authUser.updated_at || new Date().toISOString()
    };
  };

  // Get user profile from database using new unified system
  const getUserProfile = async (userId, fallbackUser = null) => {
    try {
      
      // Check if this user was recently deleted (within last 10 minutes)
      const recentlyDeleted = localStorage.getItem(`deleted_user_${userId}`);
      if (recentlyDeleted) {
        const deleteTime = parseInt(recentlyDeleted);
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        if (deleteTime > tenMinutesAgo) {
          console.log('❌ User was recently deleted');
          return null;
        } else {
          localStorage.removeItem(`deleted_user_${userId}`);
        }
      }
      
      // Try direct query with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      );
      
      const queryPromise = supabase
        .from('users_unified')
        .select('*')
        .eq('id', userId)
        .eq('status', 'Active')
        .single();

      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (!error && profile) {

        
        return {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role,
          company_id: profile.company_id,
          app_access: (() => {
            try {
              let parsedAccess = [];
              if (Array.isArray(profile.app_access)) {
                parsedAccess = profile.app_access;
              } else if (typeof profile.app_access === 'string') {
                parsedAccess = JSON.parse(profile.app_access);
              }
              
              // If empty or null, use role-based defaults
              if (!parsedAccess || parsedAccess.length === 0) {
                return getDefaultAppAccess(profile.role);
              }
              
              return parsedAccess;
            } catch (e) {
              console.warn('Failed to parse app_access, using role-based default:', e);
              return getDefaultAppAccess(profile.role);
            }
          })(),
          created_at: profile.created_at,
          updated_at: profile.updated_at
        };
      }

      // If query failed, throw error to trigger fallback
      throw new Error(error?.message || 'Profile not found');
    } catch (error) {
      // Check if it's a timeout - this is expected sometimes
      if (error.message === 'Profile fetch timeout') {
        console.warn('⏰ Profile fetch timed out, using fallback');
      } else {
        console.error('❌ Error in getUserProfile:', error);
      }
      
      // Always fall back to auth-based profile
      try {
        if (fallbackUser) {
          console.log('🔄 Using fallback user data due to error');
          return createProfileFromAuth(fallbackUser);
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        return createProfileFromAuth(user);
      } catch (authError) {
        console.error('❌ Error getting auth user:', authError);
        return null;
      }
    }
  };

  // Create user profile in database with fallback
  const createUserProfile = async (userId) => {
    try {
      console.log('📝 Creating user profile for:', userId);
      
      // Check one more time if user was recently deleted
      const recentlyDeleted = localStorage.getItem(`deleted_user_${userId}`);
      if (recentlyDeleted) {
        const deleteTime = parseInt(recentlyDeleted);
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        if (deleteTime > tenMinutesAgo) {
          console.log('❌ User was recently deleted, not creating profile');
          throw new Error('User was recently deleted');
        } else {
          localStorage.removeItem(`deleted_user_${userId}`);
        }
      }
      
      // Add timeout for profile creation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile creation timeout')), 10000)
      );
      
      // Get user info from auth
      console.log('🔍 Getting user info from auth...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ Could not get user info from auth:', userError);
        throw new Error('Could not get user info');
      }

      console.log('✅ Got user info from auth:', user.email);

      // Extract name from email if no metadata exists
      const email = user.email;
      const emailName = email.split('@')[0];
      const domain = email.split('@')[1];
      const firstName = user.user_metadata?.first_name || emailName;
      const lastName = user.user_metadata?.last_name || '';
      
      // Determine role based on email domain or user metadata
      let role = 'Employee'; // Default role
      
      // Check user metadata first (set during admin creation)
      if (user.user_metadata?.role) {
        role = user.user_metadata.role;
      }
      // Check email domain for admin users
      else if (domain === 'capacity.com') {
        role = 'Capacity Admin';
      }
      else if (domain === 'nsight.com') {
        role = 'NSight Admin';
      }
      // Check if user has admin in their name
      else if (emailName.toLowerCase().includes('admin')) {
        role = 'Admin';
      }
      
      console.log('📝 Creating profile with data:', { email, firstName, lastName, role });
      
      // Insert into users_unified table (the correct table)
      console.log('📝 Inserting into users_unified table...');
      
      const insertPromise = supabase
        .from('users_unified')
        .insert([
          {
            id: userId,
            email: email,
            first_name: firstName,
            last_name: lastName,
            role: role,
            company_id: user.user_metadata?.company_id || null,
            department: user.user_metadata?.department || '',
            status: 'Active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      const { data, error } = await Promise.race([insertPromise, timeoutPromise]);

      if (error) {
        console.error('❌ Error creating user profile:', error);
        throw error;
      }

      console.log('✅ Successfully created user profile:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in createUserProfile:', error);
      throw error;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
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
          
          // Check if this user was recently deleted
          const recentlyDeleted = localStorage.getItem(`deleted_user_${session.user.id}`);
          if (recentlyDeleted) {
            const deleteTime = parseInt(recentlyDeleted);
            const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
            if (deleteTime > tenMinutesAgo) {
              console.log('❌ User was recently deleted, clearing session');
              if (mounted) {
                setUser(null);
                setUserProfile(null);
                setLoading(false);
              }
              return;
            } else {
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
            console.error('❌ Error loading profile, using fallback:', profileError);
            // Final fallback to auth data using session user
            if (mounted) {
              const fallbackProfile = createProfileFromAuth(session.user);
              console.log('🔄 Using fallback profile:', fallbackProfile);
              setUserProfile(fallbackProfile);
            }
          }
        } else {
          console.log('ℹ️ No session found');
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
          console.log('✅ Initial session loading complete');
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
                if (mounted) {
                  setUser(null);
                  setUserProfile(null);
                }
                return;
              } else {
                localStorage.removeItem(`deleted_user_${session.user.id}`);
              }
            }
            
            setUser(session.user);
            
            // Skip profile refetch for USER_UPDATED events if we already have a profile
            if (event === 'USER_UPDATED' && userProfile && userProfile.id === session.user.id) {
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
          console.error('Error in auth state change:', error);
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

    // Safety timeout
    const timeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 15000);

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
            role: userData.role || 'Employee'
          }
        }
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { data: null, error };
    } finally {
      setIsSigningIn(false);
    }
  };

  // Admin-only user creation using service role key
  const adminCreateUser = async (email, password, userData = {}) => {
    try {
      setIsSigningIn(true);
      
      const requestBody = {
        email,
        password,
        userData: {
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          role: userData.role || 'Employee',
          company_id: userData.companyId || null
        }
      };
      
      // Use the consolidated API endpoint which uses service role key
      const response = await fetch('/api/admin/users?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      return { data: result.user, error: null };
    } catch (error) {
      console.error('Error in adminCreateUser:', error);
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
        const recentlyDeleted = localStorage.getItem(`deleted_user_${data.user.id}`);
        if (recentlyDeleted) {
          const deleteTime = parseInt(recentlyDeleted);
          const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
          if (deleteTime > tenMinutesAgo) {
            // Sign them out immediately
            await supabase.auth.signOut();
            
            // Return a clear error message
            throw new Error('This account has been deleted and is no longer available. Please contact your administrator if you believe this is an error.');
          } else {
            localStorage.removeItem(`deleted_user_${data.user.id}`);
          }
        }

        // Record successful login activity - with emergency fallback
        let profile;
        try {
          profile = await getUserProfile(data.user.id, data.user);
        } catch (profileError) {
          console.warn('Profile fetch failed during login, using auth fallback:', profileError);
          profile = createProfileFromAuth(data.user);
        }
        
        const userData = {
          name: profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : data.user.email.split('@')[0],
          role: profile?.role || 'Employee'
        };

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
        } catch (dbError) {
          console.warn('Failed to log login event:', dbError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { data: null, error };
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Record logout activity before signing out
      if (user && userProfile) {
        const userData = {
          name: userProfile.first_name && userProfile.last_name 
            ? `${userProfile.first_name} ${userProfile.last_name}` 
            : user.email.split('@')[0],
          role: userProfile.role || 'Employee'
        };

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
        } catch (dbError) {
          console.warn('Failed to log logout event:', dbError);
        }
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        // If session is already missing, treat as successful logout
        if (error.message?.includes('Auth session missing') || 
            error.name === 'AuthSessionMissingError') {
          console.log('Session already missing, treating as successful logout');
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error in signOut:', error);
      
      // If it's a session missing error, don't throw - just clear state
      if (error.message?.includes('Auth session missing') || 
          error.name === 'AuthSessionMissingError') {
        console.log('Session missing during logout, clearing state');
      } else {
        // For other errors, still clear state but re-throw
        setUser(null);
        setUserProfile(null);
        throw error;
      }
    } finally {
      // Always clear local state regardless of Supabase response
      setUser(null);
      setUserProfile(null);
      
      // Always redirect to auth page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in');

      // Try database update first using new unified table
      try {
        let { data, error } = await supabase
          .from('users_unified')
          .update({
            first_name: updates.first_name,
            last_name: updates.last_name,
            role: updates.role,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single();

        // users_unified table should exist, but if not, show error
        if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
          console.error('users_unified table not available - database setup incomplete');
          throw new Error('Database setup incomplete - users_unified table missing');
        }

        if (error) {
          throw error;
        }

        setUserProfile(data);
        return { data, error: null };
      } catch (dbError) {
        console.error('Database update failed, falling back to auth metadata:', dbError);
        
        // Fallback to auth metadata update
        const { data, error } = await supabase.auth.updateUser({
          data: {
            first_name: updates.first_name,
            last_name: updates.last_name,
            role: updates.role
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
      console.error('Error in updateProfile:', error);
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
      console.error('Error in changePassword:', error);
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
      console.error('Error in resetPassword:', error);
      return { data: null, error };
    }
  };

  // Get all users (with optional filtering to prevent data flashing)
  const getAllUsers = async (options = {}) => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Get users timeout')), 10000)
      );
      
      let fetchPromise;
      
      // Check if we should apply company filtering (to prevent data flashing)
      const applyCompanyFilter = options.applyCompanyFilter !== false; // Default to true
      
      // NSight Admins always see ALL users
      if (isGlobalAdmin(userProfile?.role)) {
        fetchPromise = supabase
          .from('users_unified')
          .select('*')
          .order('created_at', { ascending: false });
      } else if (isAnyAdmin(userProfile?.role) && !applyCompanyFilter) {
        // Admin users see all users when explicitly requested (User Management)
        fetchPromise = supabase
          .from('users_unified')
          .select('*')
          .order('created_at', { ascending: false });
      } else if (userProfile?.company_id) {
        // Other cases: filter by company to prevent flashing
        fetchPromise = supabase
          .from('users_unified')
          .select('*')
          .eq('company_id', userProfile.company_id)
          .order('created_at', { ascending: false });
      } else {
        // No company_id = no access
        return { data: [], error: null };
      }

      let { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      // users_unified table should exist, but if not, return empty array
      if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
        console.error('users_unified table not available - database setup incomplete');
        return { data: [], error: new Error('Database setup incomplete') };
      }

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getAllUsers:', error);
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
        console.warn('No company ID provided to getCompanyUsers');
        return { data: [], error: null };
      }
      

      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Get company users timeout')), 10000)
      );
      
      // Try users_unified first with company filtering
      let fetchPromise = supabase
        .from('users_unified')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      let { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      // users_unified table should exist, but if not, return empty array
      if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
        console.error('users_unified table not available - database setup incomplete');
        return { data: [], error: new Error('Database setup incomplete') };
      }

      if (error) {
        throw error;
      }


      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in getCompanyUsers:', error);
      return { 
        data: [], 
        error 
      };
    }
  };

  // Get all companies (for dynamic role creation)
  const getAllCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, company_name, website')
        .eq('status', 'Active')
        .order('company_name', { ascending: true });
      
      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting companies:', error);
      return { data: [], error };
    }
  };

  // Update user profile (for admins)
  const updateUserProfile = async (userId, updates) => {
    try {
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
      return { data: result.user, error: null };
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return { data: null, error };
    }
  };

  // Delete user profile (for admins)
  const deleteUserProfile = async (userId) => {
    try {
      // CRITICAL: Set deletion marker BEFORE deleting from database
      localStorage.setItem(`deleted_user_${userId}`, Date.now().toString());
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Delete timeout')), 10000)
      );
      
      // Try to delete from users_unified table first
      let deletePromise = supabase
        .from('users_unified')
        .delete()
        .eq('id', userId);

      let { error } = await Promise.race([deletePromise, timeoutPromise]);

      // users_unified table should exist, but if not, still mark as deleted
      if (error && (error.code === '42P01' || error.message?.includes('does not exist'))) {
        console.error('users_unified table not available - database setup incomplete');
        // Keep deletion marker even if table doesn't exist
        return { data: null, error: new Error('Database setup incomplete - user marked as deleted locally') };
      }

      if (error) {
        // Keep the deletion marker even if database deletion fails
        return { data: null, error: error };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Error in deleteUserProfile:', error);
      
      // Check if it's a timeout or other error
      if (error.message === 'Delete timeout') {
        return { data: null, error: new Error('Delete operation timed out. Please try again.') };
      }
      
      // For other errors, return the actual error
      // Keep deletion marker to prevent auto-recreation
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
      console.error('Error in assignUser:', error);
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
    getAllCompanies,
    updateUserProfile,
    deleteUserProfile,
    assignUser,
    // Helper functions
    isAuthenticated: !!user,
    isCapacityAdmin: userProfile?.role === 'Capacity Admin', // Keep for backward compatibility
    isNSightAdmin: isGlobalAdmin(userProfile?.role),
    isEmployee: userProfile?.role === EMPLOYEE_ROLE,
    isCompanyAdmin: isCompanyAdmin(userProfile?.role),
    isAnyAdmin: isAnyAdmin(userProfile?.role),
    // Get dashboard route based on role
    getDashboardRoute: () => {
      if (!userProfile) return '/dashboard';
      if (isGlobalAdmin(userProfile.role)) {
        return '/dashboard'; // NsightAdminDashboard
      } else if (isCompanyAdmin(userProfile.role)) {
        return '/dashboard'; // AdminDashboard  
      } else {
        return '/dashboard'; // EmployeeDashboard
      }
    },
    canEdit: (item) => {
      if (!user || !userProfile) return false;
      if (isAnyAdmin(userProfile.role)) return true;
      // Handle both single UUID and array formats for assigned_to
      const isAssignedTo = Array.isArray(item?.assigned_to) 
        ? item.assigned_to.includes(user.id)
        : item?.assigned_to === user.id;
      return item?.created_by === user.id || isAssignedTo;
    },
    canDelete: (item) => {
      if (!user || !userProfile) return false;
      if (isAnyAdmin(userProfile.role)) return true;
      return item?.created_by === user.id;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 