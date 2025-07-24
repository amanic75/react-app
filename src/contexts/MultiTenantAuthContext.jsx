import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import multiTenantDB from '../lib/multiTenantDatabase';
// Removed: import { recordActivity, ACTIVITY_TYPES } from '../lib/loginActivity';

const MultiTenantAuthContext = createContext();

export const useMultiTenantAuth = () => {
  const context = useContext(MultiTenantAuthContext);
  if (!context) {
    throw new Error('useMultiTenantAuth must be used within a MultiTenantAuthProvider');
  }
  return context;
};

export const MultiTenantAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [tenantConnection, setTenantConnection] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing multi-tenant auth...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Session found for user:', session.user.email);
          await loadUserWithTenant(session.user);
        } else {
          console.log('📝 No active session found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');

        if (session?.user) {
          await loadUserWithTenant(session.user);
        } else {
          // User logged out
          setUser(null);
          setUserProfile(null);
          setTenantConnection(null);
          setCompanyInfo(null);
        }

        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load user and establish tenant connection
  const loadUserWithTenant = async (authUser) => {
    try {
      console.log('👤 Loading user with tenant connection:', authUser.email);
      
      setUser(authUser);

      // Determine user's role and company
      const role = getUserRole(authUser);
      
      if (role === 'NSight Admin') {
        // NSight admins don't have a specific company/tenant
        const profile = {
          id: authUser.id,
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name || 'NSight',
          last_name: authUser.user_metadata?.last_name || 'Admin',
          role: 'NSight Admin',
          company_id: null,
          company_name: 'NSight Inc'
        };
        
        setUserProfile(profile);
        setTenantConnection(null);
        setCompanyInfo({
          id: null,
          name: 'NSight Inc',
          type: 'master',
          hasIsolatedDatabase: false
        });
        
        console.log('✅ NSight Admin loaded successfully');
        return;
      }

      // For company users, get their tenant connection
      const companyId = authUser.user_metadata?.company_id;
      if (!companyId) {
        throw new Error('Company ID not found in user metadata');
      }

      // Get tenant connection
      const tenantDb = await multiTenantDB.getTenantConnection(companyId);
      setTenantConnection(tenantDb);

      // Get user profile from tenant database
      const { data: profile, error: profileError } = await tenantDb
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('❌ Failed to load user profile from tenant:', profileError);
        // Fallback to creating profile from auth data
        const fallbackProfile = {
          id: authUser.id,
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
          role: 'Capacity Admin',
          company_id: companyId,
          company_name: authUser.user_metadata?.company_name || 'Unknown Company'
        };
        setUserProfile(fallbackProfile);
      } else {
        setUserProfile(profile);
      }

      // Get company information
      const { data: company, error: companyError } = await multiTenantDB.masterDb
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (companyError) {
        console.error('❌ Failed to load company info:', companyError);
        setCompanyInfo({
          id: companyId,
          name: authUser.user_metadata?.company_name || 'Unknown Company',
          type: 'tenant',
          hasIsolatedDatabase: true
        });
      } else {
        setCompanyInfo({
          id: company.id,
          name: company.company_name,
          type: 'tenant',
          hasIsolatedDatabase: true,
          adminEmail: company.admin_user_email,
          status: company.status
        });
      }

      console.log('✅ User loaded with tenant connection successfully');

    } catch (error) {
      console.error('❌ Failed to load user with tenant:', error);
      
      // Fallback to basic profile
      const fallbackProfile = {
        id: authUser.id,
        email: authUser.email,
        first_name: authUser.user_metadata?.first_name || 'User',
        last_name: authUser.user_metadata?.last_name || '',
        role: 'Employee',
        company_id: null,
        company_name: 'Unknown Company'
      };
      
      setUserProfile(fallbackProfile);
      setTenantConnection(null);
      setCompanyInfo({
        id: null,
        name: 'Unknown Company',
        type: 'unknown',
        hasIsolatedDatabase: false
      });
    }
  };

  // Determine user role from auth metadata
  const getUserRole = (authUser) => {
    const role = authUser.user_metadata?.role;
    const email = authUser.email;
    
    if (role === 'NSight Admin' || email.includes('nsight-inc.com')) {
      return 'NSight Admin';
    } else if (role === 'Capacity Admin' || email.includes('admin')) {
      return 'Capacity Admin';
    } else {
      return 'Employee';
    }
  };

  // Sign in with multi-tenant routing
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

      console.log('✅ Authentication successful, setting up tenant connection...');
      
      // loadUserWithTenant will be called automatically by auth state change
      
      // Record login activity
      // recordActivity(ACTIVITY_TYPES.LOGIN, email, {
      //   name: data.user.user_metadata?.first_name || email.split('@')[0],
      //   role: getUserRole(data.user)
      // });

      return { success: true };

    } catch (error) {
      console.error('❌ Multi-tenant sign in failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSigningIn(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Record logout activity
      // if (user && userProfile) {
      //   recordActivity(ACTIVITY_TYPES.LOGOUT, user.email, {
      //     name: `${userProfile.first_name} ${userProfile.last_name}`.trim(),
      //     role: userProfile.role
      //   });
      // }

      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      // Clear state
      setUser(null);
      setUserProfile(null);
      setTenantConnection(null);
      setCompanyInfo(null);

      console.log('✅ Multi-tenant sign out successful');

    } catch (error) {
      console.error('❌ Multi-tenant sign out failed:', error);
      throw error;
    }
  };

  // Get database connection (tenant or master)
  const getDatabaseConnection = () => {
    if (userProfile?.role === 'NSight Admin') {
      return multiTenantDB.masterDb;
    }
    return tenantConnection || multiTenantDB.masterDb;
  };

  // Check if user has access to specific company
  const hasCompanyAccess = (companyId) => {
    if (userProfile?.role === 'NSight Admin') {
      return true; // NSight admins can access all companies
    }
    return userProfile?.company_id === companyId;
  };

  // Get user's apps from tenant database
  const getUserApps = async () => {
    try {
      const db = getDatabaseConnection();
      
      if (userProfile?.role === 'NSight Admin') {
        // NSight admins see company management apps
        return [
          { id: 'companies', name: 'Companies', icon: 'Building2' },
          { id: 'tenants', name: 'Tenant Management', icon: 'Database' }
        ];
      }

      // Get apps from tenant database
      const { data: apps, error } = await db
        .from('apps')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Failed to fetch user apps:', error);
        return [];
      }

      return apps.map(app => ({
        id: app.id,
        name: app.app_name,
        description: app.app_description,
        icon: app.app_icon,
        color: app.app_color,
        tableName: app.table_name
      }));

    } catch (error) {
      console.error('❌ Failed to get user apps:', error);
      return [];
    }
  };

  // Change password
  const changePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      console.log('✅ Password changed successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Password change failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Create user in tenant database (for company admins)
  const createTenantUser = async (userData) => {
    try {
      if (userProfile?.role !== 'Capacity Admin') {
        throw new Error('Only company admins can create users');
      }

      const db = getDatabaseConnection();
      
      // Create auth user first
      const { data: authUser, error: authError } = await multiTenantDB.masterDb.auth.admin.createUser({
        email: userData.email,
        password: userData.password || 'TempPassword123!',
        email_confirm: true,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role || 'Employee',
          company_id: userProfile.company_id,
          company_name: companyInfo.name
        }
      });

      if (authError) {
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      // Create user profile in tenant database
      const { data: profile, error: profileError } = await db
        .from('user_profiles')
        .insert({
          id: authUser.user.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role || 'Employee',
          department: userData.department || '',
          company_id: userProfile.company_id,
          app_access: userData.appAccess || ['formulas']
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      console.log('✅ Tenant user created successfully:', profile.email);
      return { success: true, user: profile };

    } catch (error) {
      console.error('❌ Failed to create tenant user:', error);
      return { success: false, error: error.message };
    }
  };

  // Get all users in tenant
  const getTenantUsers = async () => {
    try {
      const db = getDatabaseConnection();
      
      if (userProfile?.role === 'NSight Admin') {
        // NSight admins see all users across all companies
        const { data: users, error } = await db
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch users: ${error.message}`);
        }

        return users;
      }

      // Company users see only their company's users
      const { data: users, error } = await db
        .from('user_profiles')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch tenant users: ${error.message}`);
      }

      return users;

    } catch (error) {
      console.error('❌ Failed to get tenant users:', error);
      return [];
    }
  };

  const value = {
    user,
    userProfile,
    tenantConnection,
    companyInfo,
    loading,
    isSigningIn,
    signIn,
    signOut,
    changePassword,
    createTenantUser,
    getTenantUsers,
    getUserApps,
    getDatabaseConnection,
    hasCompanyAccess,
    
    // Helper functions
    isAuthenticated: !!user,
    isNSightAdmin: userProfile?.role === 'NSight Admin',
    isCapacityAdmin: userProfile?.role === 'Capacity Admin',
    isEmployee: userProfile?.role === 'Employee',
    hasTenantAccess: !!tenantConnection,
    
    // Dashboard routing
    getDashboardRoute: () => {
      if (!userProfile) return '/dashboard';
      switch (userProfile.role) {
        case 'NSight Admin':
          return '/dashboard';
        case 'Capacity Admin':
          return '/dashboard';
        case 'Employee':
          return '/dashboard';
        default:
          return '/dashboard';
      }
    }
  };

  return (
    <MultiTenantAuthContext.Provider value={value}>
      {children}
    </MultiTenantAuthContext.Provider>
  );
}; 