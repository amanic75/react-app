// Role utility functions for company-specific admin roles

// Global admin role
export const GLOBAL_ADMIN_ROLE = 'NSight Admin';

// Basic employee role  
export const EMPLOYEE_ROLE = 'Employee';

// Known company admin role patterns (for initial setup)
export const KNOWN_COMPANY_ADMINS = [
  'Capacity Admin',
  'Apple Admin', 
  'Nvidia Admin',
  'Jackson Admin'
];

// Pattern for company admin roles: "{Company Name} Admin"
export const COMPANY_ADMIN_PATTERN = /^(.+) Admin$/;

/**
 * Check if a role is a company-specific admin role
 * @param {string} role - The role to check
 * @returns {boolean} - True if it's a company admin role
 */
export const isCompanyAdmin = (role) => {
  if (!role) return false;
  // Check if it matches the "{Company Name} Admin" pattern
  return COMPANY_ADMIN_PATTERN.test(role) && role !== GLOBAL_ADMIN_ROLE;
};

/**
 * Check if a role is the global admin role
 * @param {string} role - The role to check
 * @returns {boolean} - True if it's NSight Admin
 */
export const isGlobalAdmin = (role) => {
  return role === GLOBAL_ADMIN_ROLE;
};

/**
 * Check if a role is any type of admin (company or global)
 * @param {string} role - The role to check
 * @returns {boolean} - True if it's any admin role
 */
export const isAnyAdmin = (role) => {
  return isGlobalAdmin(role) || isCompanyAdmin(role);
};

/**
 * Check if a role is an employee
 * @param {string} role - The role to check
 * @returns {boolean} - True if it's employee role
 */
export const isEmployee = (role) => {
  return role === EMPLOYEE_ROLE;
};

/**
 * Get company name from admin role
 * @param {string} role - The admin role
 * @returns {string|null} - Company name or null if not a company admin
 */
export const getCompanyFromAdminRole = (role) => {
  if (!isCompanyAdmin(role)) return null;
  
  // Extract company name by removing " Admin" suffix
  return role.replace(' Admin', '');
};

/**
 * Create company admin role from company name
 * @param {string} companyName - The company name
 * @returns {string} - The corresponding admin role
 */
export const createCompanyAdminRole = (companyName) => {
  return `${companyName} Admin`;
};

/**
 * Determine company admin role from email domain
 * @param {string} domain - Email domain (e.g., 'johnson.com')
 * @param {Array} companies - Optional array of company objects to match against
 * @returns {string|null} - Company admin role or null if not determinable
 */
export const getCompanyAdminRoleFromDomain = (domain, companies = []) => {
  if (!domain) return null;

  // Known domain mappings for existing companies
  const domainMappings = {
    'capacity.com': 'Capacity Admin',
    'capacitychemicals.com': 'Capacity Admin',
    'apple.com': 'Apple Admin',
    'nvidia.com': 'Nvidia Admin', 
    'jackson.com': 'Jackson Admin',
    'nsight.com': GLOBAL_ADMIN_ROLE,
    'nsight-inc.com': GLOBAL_ADMIN_ROLE
  };

  // Check known mappings first
  if (domainMappings[domain]) {
    return domainMappings[domain];
  }

  // Try to match against provided companies
  if (companies && companies.length > 0) {
    for (const company of companies) {
      const companyDomain = company.website ? 
        new URL(company.website).hostname.replace('www.', '') : 
        null;
      
      if (companyDomain === domain) {
        return createCompanyAdminRole(company.company_name);
      }
    }
  }

  // Fallback: create role from domain name
  const companyName = domain.split('.')[0];
  const capitalizedCompany = companyName.charAt(0).toUpperCase() + companyName.slice(1);
  return createCompanyAdminRole(capitalizedCompany);
};

/**
 * Get default app access based on role
 * @param {string} role - The user role
 * @returns {string[]} - Array of app access permissions
 */
export const getDefaultAppAccess = (role) => {
  if (isGlobalAdmin(role)) {
    return ['developer-mode', 'existing-company-mode'];
  } else if (isCompanyAdmin(role)) {
    return ['formulas', 'suppliers', 'raw-materials'];
  } else if (isEmployee(role)) {
    return ['formulas'];
  }
  return ['formulas']; // Default fallback
};

/**
 * Get default credentials text based on role
 * @param {string} role - The user role
 * @returns {string} - Default credentials text
 */
export const getDefaultCredentials = (role) => {
  if (isGlobalAdmin(role)) {
    return 'nsight-admin/enterprise pass';
  } else if (isCompanyAdmin(role)) {
    return 'admin/secure pass';
  } else if (isEmployee(role)) {
    return 'user/temporary pass';
  }
  return 'user/temporary pass'; // Default fallback
};

/**
 * Get role display name for UI
 * @param {string} role - The role
 * @returns {string} - Display name for the role
 */
export const getRoleDisplayName = (role) => {
  if (isCompanyAdmin(role)) {
    // Show "Company Admin" for company admins in some contexts
    return role;
  }
  return role;
};

/**
 * Get role color class for UI styling
 * @param {string} role - The role
 * @returns {string} - CSS color classes
 */
export const getRoleColor = (role) => {
  if (isGlobalAdmin(role)) {
    return 'text-purple-600 bg-purple-100';
  } else if (isCompanyAdmin(role)) {
    return 'text-green-600 bg-green-100';
  } else if (isEmployee(role)) {
    return 'text-blue-600 bg-blue-100';
  }
  return 'text-slate-600 bg-slate-100';
};

/**
 * Check if user can edit another user based on roles
 * @param {string} currentUserRole - The current user's role
 * @param {string} targetUserRole - The target user's role
 * @returns {boolean} - True if current user can edit target user
 */
export const canEditUser = (currentUserRole, targetUserRole) => {
  // NSight Admins can edit everyone
  if (isGlobalAdmin(currentUserRole)) {
    return true;
  }
  
  // Company Admins cannot edit NSight Admins
  if (isCompanyAdmin(currentUserRole) && isGlobalAdmin(targetUserRole)) {
    return false;
  }
  
  // Company Admins can edit other company admins and employees in their company
  if (isCompanyAdmin(currentUserRole)) {
    return true; // Company filtering will be handled by data access logic
  }
  
  // Employees cannot edit anyone
  return false;
};

/**
 * Get available role options for user based on their current role
 * @param {string} currentUserRole - The current user's role
 * @param {Array} companies - Optional array of company objects {name, id}
 * @returns {Array} - Array of role options {value, label, credentials}
 */
export const getAvailableRoleOptions = (currentUserRole, companies = []) => {
  const baseRoles = [
    { value: EMPLOYEE_ROLE, label: 'Employee', credentials: getDefaultCredentials(EMPLOYEE_ROLE) }
  ];
  
  // Add company admin roles based on available companies
  if (companies && companies.length > 0) {
    companies.forEach(company => {
      const adminRole = createCompanyAdminRole(company.name);
      baseRoles.push({
        value: adminRole,
        label: adminRole,
        credentials: getDefaultCredentials(adminRole)
      });
    });
  } else {
    // Fallback to known company admin roles if no companies provided
    KNOWN_COMPANY_ADMINS.forEach(role => {
      baseRoles.push({
        value: role,
        label: role,
        credentials: getDefaultCredentials(role)
      });
    });
  }
  
  // Only NSight Admins can create other NSight Admins
  if (isGlobalAdmin(currentUserRole)) {
    baseRoles.push({
      value: GLOBAL_ADMIN_ROLE,
      label: GLOBAL_ADMIN_ROLE,
      credentials: getDefaultCredentials(GLOBAL_ADMIN_ROLE)
    });
  }
  
  return baseRoles;
};