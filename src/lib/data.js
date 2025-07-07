// Mock chemical data for Chemformation module
export const chemicalData = [
  {
    id: 1,
    name: 'Benzene',
    formula: 'C6H6',
    status: 'Approved',
    lastUpdated: '2024-01-15'
  },
  {
    id: 2,
    name: 'Methanol',
    formula: 'CH3OH',
    status: 'Under Review',
    lastUpdated: '2024-01-12'
  },
  {
    id: 3,
    name: 'Acetone',
    formula: 'C3H6O',
    status: 'Approved',
    lastUpdated: '2024-01-10'
  },
  {
    id: 4,
    name: 'Ethylene Glycol',
    formula: 'C2H6O2',
    status: 'Approved',
    lastUpdated: '2024-01-08'
  }
];

// Helper function to generate random dates
const getRandomDate = (daysBack = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString().split('T')[0];
};

// Helper function to get random app access
const getRandomAppAccess = () => {
  const apps = ['formulas', 'suppliers', 'raw-materials'];
  const numApps = Math.floor(Math.random() * 3) + 1; // 1-3 apps
  const shuffled = apps.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numApps);
};

// Default user data for admin dashboard
const defaultUserData = [
  // Original user
  {
    id: 1,
    name: 'Aidan Manickam',
    email: 'aidan@capacity.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: '2024-01-15',
    contact: '',
    appAccess: ['formulas', 'suppliers'],
    credentials: 'user/temporary pass'
  },

  // Demo admin accounts
  {
    id: 81,
    name: 'Demo Capacity Admin',
    email: 'capacity@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 82,
    name: 'Demo NSight Admin',
    email: 'nsight@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 83,
    name: 'Demo Employee',
    email: 'employee@domain.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas'],
    credentials: 'user/temporary pass'
  },
  
  // 49 Additional Employees with various domains
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@gmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.chen@yahoo.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 4,
    name: 'Emma Davis',
    email: 'emma.davis@outlook.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 5,
    name: 'James Wilson',
    email: 'james.wilson@hotmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 6,
    name: 'Ashley Rodriguez',
    email: 'ashley.rodriguez@icloud.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 7,
    name: 'David Thompson',
    email: 'david.thompson@protonmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 8,
    name: 'Jessica Martinez',
    email: 'jessica.martinez@gmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 9,
    name: 'Robert Anderson',
    email: 'robert.anderson@yahoo.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 10,
    name: 'Lisa Garcia',
    email: 'lisa.garcia@outlook.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 11,
    name: 'Christopher Taylor',
    email: 'christopher.taylor@hotmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 12,
    name: 'Amanda White',
    email: 'amanda.white@icloud.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 13,
    name: 'Matthew Brown',
    email: 'matthew.brown@gmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 14,
    name: 'Nicole Harris',
    email: 'nicole.harris@yahoo.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 15,
    name: 'Daniel Clark',
    email: 'daniel.clark@outlook.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 16,
    name: 'Stephanie Lewis',
    email: 'stephanie.lewis@protonmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 17,
    name: 'Kevin Walker',
    email: 'kevin.walker@gmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 18,
    name: 'Rachel Hall',
    email: 'rachel.hall@hotmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 19,
    name: 'Brandon Allen',
    email: 'brandon.allen@icloud.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 20,
    name: 'Megan Young',
    email: 'megan.young@yahoo.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 21,
    name: 'Tyler King',
    email: 'tyler.king@outlook.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 22,
    name: 'Samantha Wright',
    email: 'samantha.wright@gmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 23,
    name: 'Andrew Lopez',
    email: 'andrew.lopez@protonmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 24,
    name: 'Lauren Hill',
    email: 'lauren.hill@hotmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 25,
    name: 'Joshua Scott',
    email: 'joshua.scott@icloud.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 26,
    name: 'Brittany Green',
    email: 'brittany.green@gmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 27,
    name: 'Nathan Adams',
    email: 'nathan.adams@yahoo.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 28,
    name: 'Kayla Baker',
    email: 'kayla.baker@outlook.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 29,
    name: 'Ryan Gonzalez',
    email: 'ryan.gonzalez@protonmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 30,
    name: 'Alexis Nelson',
    email: 'alexis.nelson@hotmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 31,
    name: 'Jordan Carter',
    email: 'jordan.carter@icloud.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 32,
    name: 'Taylor Mitchell',
    email: 'taylor.mitchell@gmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 33,
    name: 'Austin Perez',
    email: 'austin.perez@yahoo.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 34,
    name: 'Chloe Roberts',
    email: 'chloe.roberts@outlook.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 35,
    name: 'Marcus Turner',
    email: 'marcus.turner@protonmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 36,
    name: 'Jasmine Phillips',
    email: 'jasmine.phillips@hotmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 37,
    name: 'Ethan Campbell',
    email: 'ethan.campbell@icloud.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 38,
    name: 'Victoria Parker',
    email: 'victoria.parker@gmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 39,
    name: 'Cameron Evans',
    email: 'cameron.evans@yahoo.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 40,
    name: 'Destiny Edwards',
    email: 'destiny.edwards@outlook.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 41,
    name: 'Blake Collins',
    email: 'blake.collins@protonmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 42,
    name: 'Paige Stewart',
    email: 'paige.stewart@hotmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 43,
    name: 'Hunter Sanchez',
    email: 'hunter.sanchez@icloud.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 44,
    name: 'Sierra Morris',
    email: 'sierra.morris@gmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 45,
    name: 'Caleb Rogers',
    email: 'caleb.rogers@yahoo.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 46,
    name: 'Autumn Reed',
    email: 'autumn.reed@outlook.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 47,
    name: 'Garrett Cook',
    email: 'garrett.cook@protonmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 48,
    name: 'Savannah Bailey',
    email: 'savannah.bailey@hotmail.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 49,
    name: 'Derek Rivera',
    email: 'derek.rivera@icloud.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },
  {
    id: 50,
    name: 'Trevor Richardson',
    email: 'trevor.richardson@yahoo.com',
    role: 'Employee',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: getRandomAppAccess(),
    credentials: 'user/temporary pass'
  },

  // 15 Capacity Admins (@capacity.com)
  {
    id: 51,
    name: 'Alexandra Bennett',
    email: 'alexandra.bennett@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 52,
    name: 'Jonathan Martinez',
    email: 'jonathan.martinez@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 53,
    name: 'Michelle Thompson',
    email: 'michelle.thompson@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 54,
    name: 'Steven Rodriguez',
    email: 'steven.rodriguez@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 55,
    name: 'Rebecca Davis',
    email: 'rebecca.davis@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 56,
    name: 'Kenneth Wilson',
    email: 'kenneth.wilson@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 57,
    name: 'Patricia Moore',
    email: 'patricia.moore@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 58,
    name: 'Gregory Taylor',
    email: 'gregory.taylor@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 59,
    name: 'Diana Anderson',
    email: 'diana.anderson@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 60,
    name: 'Benjamin Jackson',
    email: 'benjamin.jackson@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 61,
    name: 'Catherine White',
    email: 'catherine.white@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 62,
    name: 'Philip Harris',
    email: 'philip.harris@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 63,
    name: 'Stephanie Martin',
    email: 'stephanie.martin@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 64,
    name: 'Ronald Clark',
    email: 'ronald.clark@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },
  {
    id: 65,
    name: 'Melissa Lewis',
    email: 'melissa.lewis@capacity.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['formulas', 'suppliers', 'raw-materials'],
    credentials: 'admin/secure pass'
  },

  // 15 NSight Admins (@nsight-inc.com)
  {
    id: 66,
    name: 'Alexander Pierce',
    email: 'alexander.pierce@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 67,
    name: 'Samantha Foster',
    email: 'samantha.foster@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 68,
    name: 'Nicholas Ward',
    email: 'nicholas.ward@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 69,
    name: 'Jennifer Torres',
    email: 'jennifer.torres@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 70,
    name: 'Gabriel Peterson',
    email: 'gabriel.peterson@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 71,
    name: 'Christina Gray',
    email: 'christina.gray@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 72,
    name: 'Lucas Ramirez',
    email: 'lucas.ramirez@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 73,
    name: 'Vanessa James',
    email: 'vanessa.james@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 74,
    name: 'Victor Watson',
    email: 'victor.watson@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 75,
    name: 'Monica Brooks',
    email: 'monica.brooks@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 76,
    name: 'Adrian Kelly',
    email: 'adrian.kelly@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 77,
    name: 'Natalie Sanders',
    email: 'natalie.sanders@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 78,
    name: 'Isaac Price',
    email: 'isaac.price@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 79,
    name: 'Olivia Bennett',
    email: 'olivia.bennett@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  },
  {
    id: 80,
    name: 'Mason Powell',
    email: 'mason.powell@nsight-inc.com',
    role: 'NSight Admin',
    status: 'Active',
    lastLogin: getRandomDate(),
    contact: '',
    appAccess: ['developer-mode', 'existing-company-mode'],
    credentials: 'nsight-admin/enterprise pass'
  }
];

// Load user data from localStorage or use default
const loadUserData = () => {
  const saved = localStorage.getItem('capacity-users');
  const version = localStorage.getItem('capacity-users-version');
  const currentVersion = '1.1'; // Updated version to force refresh with new demo accounts
  
  // If version doesn't match, clear old data and use default
  if (version !== currentVersion) {
    localStorage.removeItem('capacity-users');
    localStorage.setItem('capacity-users-version', currentVersion);
    console.log('User data version updated, using fresh data');
    return [...defaultUserData];
  }
  
  return saved ? JSON.parse(saved) : [...defaultUserData];
};

// Save user data to localStorage
const saveUserData = () => {
  localStorage.setItem('capacity-users', JSON.stringify(userData));
};

// Initialize user data
let userData = loadUserData();

// Function to add new user
export const addUser = (user) => {
  userData.push(user);
  saveUserData();
};

// Function to update existing user
export const updateUser = (updatedUser) => {
  const index = userData.findIndex(user => user.id === updatedUser.id);
  if (index !== -1) {
    userData[index] = { ...userData[index], ...updatedUser };
    saveUserData();
  }
};

// Function to delete user
export const deleteUser = (userId) => {
  const index = userData.findIndex(user => user.id === userId);
  if (index !== -1) {
    userData.splice(index, 1);
    saveUserData();
  }
};

// Function to get users (for table display)
export const getUsers = () => {
  return [...userData];
};

// Export userData for backward compatibility
export { userData };

// Function to manually clear all cached data (for debugging)
export const clearUserCache = () => {
  localStorage.removeItem('capacity-users');
  localStorage.removeItem('capacity-users-version');
  console.log('User cache cleared. Refresh the page to reload fresh data.');
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.clearUserCache = clearUserCache;
}

// Function to generate material ID from name
export const generateMaterialId = (materialName) => {
  return materialName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
};

// Shared raw materials data - single source of truth
export const rawMaterialsData = [
  { 
    id: generateMaterialId('CALCIUM CHLORIDE (100%)'),
    materialName: 'CALCIUM CHLORIDE (100%)', 
    supplierName: 'ChemSupply Co.', 
    manufacture: 'Dow Chemical', 
    tradeName: 'DowFlake Xtra', 
    supplierCost: 2.15,
    casNumber: '10043-52-4',
    weightVolume: 8.34,
    density: 2.15,
    country: 'USA',
    description: 'High purity calcium chloride for industrial applications. Used as a desiccant, deicing agent, and concrete accelerator. Excellent solubility in water with strong exothermic reaction. Essential for oil and gas drilling operations.',
    physicalForm: 'Flakes',
    purity: '100%',
    storageConditions: 'Store in dry place, avoid moisture. Keep container tightly closed.',
    hazardClass: 'Irritant',
    shelfLife: '24 months'
  },
  { 
    id: generateMaterialId('60% HEDP Liquid Tech Grade'),
    materialName: '60% HEDP Liquid Tech Grade', 
    supplierName: 'Industrial Chemicals Ltd.', 
    manufacture: 'Kemira', 
    tradeName: 'Dequest 2010', 
    supplierCost: 3.45,
    casNumber: '2809-21-4',
    weightVolume: 9.2,
    density: 1.4,
    country: 'Finland',
    description: 'Chelating agent for water treatment applications. Excellent scale and corrosion inhibitor. Forms stable complexes with metal ions. Used in cooling water systems, boiler water treatment, and textile processing.',
    physicalForm: 'Liquid',
    purity: '60%',
    storageConditions: 'Store at room temperature. Protect from freezing.',
    hazardClass: 'Corrosive',
    shelfLife: '12 months'
  },
  { 
    id: generateMaterialId('Acetic Acid, Glacial'),
    materialName: 'Acetic Acid, Glacial', 
    supplierName: 'Acid Solutions Inc.', 
    manufacture: 'Eastman Chemical', 
    tradeName: 'Glacial Acetic Acid', 
    supplierCost: 8.76,
    casNumber: '64-19-7',
    weightVolume: 8.74,
    density: 1.05,
    country: 'USA',
    description: 'Pure acetic acid for chemical synthesis and pH adjustment. High purity grade suitable for analytical and industrial applications. Used in manufacturing acetate esters, cellulose acetate, and various chemical intermediates.',
    physicalForm: 'Liquid',
    purity: '99.5%',
    storageConditions: 'Store in cool, dry place. Keep away from heat sources.',
    hazardClass: 'Corrosive',
    shelfLife: '36 months'
  },
  { 
    id: generateMaterialId('Sodium Molybdate Crystals, Tech Grade'),
    materialName: 'Sodium Molybdate Crystals, Tech Grade', 
    supplierName: 'Specialty Metals Corp.', 
    manufacture: 'Climax Molybdenum', 
    tradeName: 'Sodium Molybdate Dihydrate', 
    supplierCost: 12.50,
    casNumber: '10102-40-6',
    weightVolume: 22.4,
    density: 3.78,
    country: 'USA',
    description: 'Technical grade sodium molybdate for corrosion inhibition and metal treatment. Provides excellent protection against pitting and general corrosion. Used in cooling water systems and as a corrosion inhibitor additive.',
    physicalForm: 'Crystals',
    purity: 'Technical Grade',
    storageConditions: 'Store in dry conditions. Protect from moisture.',
    hazardClass: 'Non-hazardous',
    shelfLife: '60 months'
  },
  { 
    id: generateMaterialId('HPMA (homopolymer of maleic acid) 50%'),
    materialName: 'HPMA (homopolymer of maleic acid) 50%', 
    supplierName: 'Polymer Technologies', 
    manufacture: 'Dow Chemical', 
    tradeName: 'Belclene 200', 
    supplierCost: 5.65,
    casNumber: '26677-99-6',
    weightVolume: 9.8,
    density: 1.18,
    country: 'USA',
    description: 'Scale inhibitor polymer for water treatment. Prevents calcium carbonate, calcium sulfate, and calcium phosphate scale formation. Effective over wide pH range. Used in cooling towers, boilers, and reverse osmosis systems.',
    physicalForm: 'Liquid',
    purity: '50%',
    storageConditions: 'Store between 5-40°C. Do not freeze.',
    hazardClass: 'Non-hazardous',
    shelfLife: '24 months'
  },
  { 
    id: generateMaterialId('PBTC Phosphonobutane Tricarboxylic Acid'),
    materialName: 'PBTC Phosphonobutane Tricarboxylic Acid', 
    supplierName: 'Water Treatment Chemicals', 
    manufacture: 'Italmatch Chemicals', 
    tradeName: 'Dequest 7000', 
    supplierCost: 1.55,
    casNumber: '37971-36-1',
    weightVolume: 10.2,
    density: 1.25,
    country: 'Italy',
    description: 'Organophosphonate for scale and corrosion control. Excellent chelating properties for metal ions. Superior performance in high temperature and high pH conditions. Used in industrial water treatment and oil field applications.',
    physicalForm: 'Liquid',
    purity: '50%',
    storageConditions: 'Store at room temperature. Avoid freezing.',
    hazardClass: 'Irritant',
    shelfLife: '24 months'
  },
  { 
    id: generateMaterialId('Sodium Hypochlorite Solution 12.5%'),
    materialName: 'Sodium Hypochlorite Solution 12.5%', 
    supplierName: 'Bleach Supply Co.', 
    manufacture: 'Olin Corporation', 
    tradeName: 'Liquid Bleach', 
    supplierCost: 2.34,
    casNumber: '7681-52-9',
    weightVolume: 10.4,
    density: 1.2,
    country: 'USA',
    description: 'Chlorine-based disinfectant and bleaching agent. Powerful oxidizing agent for water disinfection and surface sanitization. Effective against bacteria, viruses, and algae. Used in municipal water treatment and swimming pool maintenance.',
    physicalForm: 'Liquid',
    purity: '12.5%',
    storageConditions: 'Store in cool, dark place. Protect from light and heat.',
    hazardClass: 'Oxidizer, Corrosive',
    shelfLife: '6 months'
  },
  { 
    id: generateMaterialId('Citric Acid Anhydrous'),
    materialName: 'Citric Acid Anhydrous', 
    supplierName: 'Food Grade Chemicals', 
    manufacture: 'Cargill', 
    tradeName: 'CitriSafe', 
    supplierCost: 3.45,
    casNumber: '77-92-9',
    weightVolume: 13.9,
    density: 1.67,
    country: 'Brazil',
    description: 'Food grade citric acid for pH adjustment and chelation. Natural preservative and flavoring agent. Used in food and beverage industry, cosmetics, and cleaning products. Excellent buffering capacity and metal chelation properties.',
    physicalForm: 'Powder',
    purity: '99.5%',
    storageConditions: 'Store in dry conditions. Keep away from moisture.',
    hazardClass: 'Non-hazardous',
    shelfLife: '60 months'
  },
  { 
    id: generateMaterialId('Hydrogen Peroxide 35%'),
    materialName: 'Hydrogen Peroxide 35%', 
    supplierName: 'Peroxide Solutions LLC', 
    manufacture: 'Solvay', 
    tradeName: 'Proxitane AHP35', 
    supplierCost: 4.89,
    casNumber: '7722-84-1',
    weightVolume: 9.4,
    density: 1.13,
    country: 'Belgium',
    description: 'Industrial grade hydrogen peroxide for oxidation processes. Powerful oxidizing and bleaching agent. Used in pulp and paper bleaching, water treatment, and chemical synthesis. Environmentally friendly as it decomposes to water and oxygen.',
    physicalForm: 'Liquid',
    purity: '35%',
    storageConditions: 'Store in cool, ventilated area. Keep away from heat and combustibles.',
    hazardClass: 'Oxidizer, Corrosive',
    shelfLife: '12 months'
  },
  { 
    id: generateMaterialId('Potassium Hydroxide Flakes 90%'),
    materialName: 'Potassium Hydroxide Flakes 90%', 
    supplierName: 'Caustic Supply Inc.', 
    manufacture: 'Olin Corporation', 
    tradeName: 'KOH Technical Grade', 
    supplierCost: 6.78,
    casNumber: '1310-58-3',
    weightVolume: 17.0,
    density: 2.04,
    country: 'USA',
    description: 'Technical grade potassium hydroxide for pH adjustment and chemical processing. Strong alkaline material used in soap manufacturing, biodiesel production, and water treatment. Highly soluble in water with significant heat generation.',
    physicalForm: 'Flakes',
    purity: '90%',
    storageConditions: 'Store in dry, sealed containers. Protect from moisture and CO2.',
    hazardClass: 'Corrosive',
    shelfLife: '60 months'
  }
];

// Local state for managing materials data with localStorage persistence
const MATERIALS_STORAGE_KEY = 'raw_materials_data';

// Initialize materials state from localStorage or default data
const initializeMaterialsState = () => {
  try {
    const stored = localStorage.getItem(MATERIALS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load materials from localStorage:', error);
  }
  // Return default data if localStorage is empty or fails
  return [...rawMaterialsData];
};

let materialsState = initializeMaterialsState();

// Save materials state to localStorage
const saveMaterialsState = () => {
  try {
    localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(materialsState));
  } catch (error) {
    console.warn('Failed to save materials to localStorage:', error);
  }
};

// Get all materials
export const getAllMaterials = () => {
  return [...materialsState];
};

// Get material by ID
export const getMaterialById = (id) => {
  return materialsState.find(material => material.id === id);
};

// Update material
export const updateMaterial = (materialId, updatedData) => {
  const index = materialsState.findIndex(material => material.id === materialId);
  if (index !== -1) {
    materialsState[index] = { ...materialsState[index], ...updatedData };
    saveMaterialsState(); // Persist changes
    return materialsState[index];
  }
  return null;
};

// Add new material
export const addMaterial = (materialData) => {
  const newMaterial = {
    ...materialData,
    id: generateMaterialId(materialData.materialName)
  };
  materialsState.push(newMaterial);
  saveMaterialsState(); // Persist changes
  return newMaterial;
};

// Reset materials to default data (useful for demo purposes)
export const resetMaterialsToDefault = () => {
  materialsState = [...rawMaterialsData];
  saveMaterialsState();
  return materialsState;
};

// ==============================================
// FORMULAS DATA MANAGEMENT WITH LOCALSTORAGE
// ==============================================

// Shared formulas data - single source of truth
export const formulasData = [
  { 
    id: 'HDST001', 
    name: 'Heavy Duty Steam Title Placeholder', 
    totalCost: 245.67, 
    finalSalePriceDrum: 589.99, 
    finalSalePriceTote: 1249.99,
    ingredients: [
      { name: 'Sodium Hydroxide', percentage: 35.2, cost: 87.45 },
      { name: 'Calcium Carbonate', percentage: 25.8, cost: 56.23 },
      { name: 'Ethylene Glycol', percentage: 20.1, cost: 78.12 },
      { name: 'Surfactant Blend', percentage: 12.4, cost: 23.87 },
      { name: 'Corrosion Inhibitor', percentage: 6.5, cost: 0.00 }
    ]
  },
  { 
    id: 'MDCL002', 
    name: 'Multi-Purpose Degreaser Compound', 
    totalCost: 156.34, 
    finalSalePriceDrum: 389.99, 
    finalSalePriceTote: 799.99,
    ingredients: [
      { name: 'Isopropyl Alcohol', percentage: 45.0, cost: 78.90 },
      { name: 'Sodium Carbonate', percentage: 25.0, cost: 34.12 },
      { name: 'Citric Acid', percentage: 15.0, cost: 23.45 },
      { name: 'Non-ionic Surfactant', percentage: 10.0, cost: 19.87 },
      { name: 'Water', percentage: 5.0, cost: 0.00 }
    ]
  },
  { 
    id: 'INDL003', 
    name: 'Industrial Solvent Formula XP', 
    totalCost: 334.12, 
    finalSalePriceDrum: 789.99, 
    finalSalePriceTote: 1549.99,
    ingredients: [
      { name: 'Methylene Chloride', percentage: 40.0, cost: 145.67 },
      { name: 'Acetone', percentage: 30.0, cost: 89.34 },
      { name: 'Toluene', percentage: 20.0, cost: 67.23 },
      { name: 'Stabilizer Blend', percentage: 8.0, cost: 31.88 },
      { name: 'Antioxidant', percentage: 2.0, cost: 0.00 }
    ]
  }
];

// Local state for managing formulas data with localStorage persistence
const FORMULAS_STORAGE_KEY = 'formulas_data';

// Initialize formulas state from localStorage or default data
const initializeFormulasState = () => {
  try {
    const stored = localStorage.getItem(FORMULAS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load formulas from localStorage:', error);
  }
  // Return default data if localStorage is empty or fails
  return [...formulasData];
};

let formulasState = initializeFormulasState();

// Save formulas state to localStorage
const saveFormulasState = () => {
  try {
    localStorage.setItem(FORMULAS_STORAGE_KEY, JSON.stringify(formulasState));
  } catch (error) {
    console.warn('Failed to save formulas to localStorage:', error);
  }
};

// Get all formulas
export const getAllFormulas = () => {
  return [...formulasState];
};

// Get formula by ID
export const getFormulaById = (id) => {
  return formulasState.find(formula => formula.id === id);
};

// Update formula
export const updateFormula = (formulaId, updatedData) => {
  const index = formulasState.findIndex(formula => formula.id === formulaId);
  if (index !== -1) {
    formulasState[index] = { ...formulasState[index], ...updatedData };
    saveFormulasState(); // Persist changes
    return formulasState[index];
  }
  return null;
};

// Add new formula
export const addFormula = (formulaData) => {
  const newFormula = {
    ...formulaData,
    id: formulaData.id || `FORM${Date.now()}`
  };
  formulasState.push(newFormula);
  saveFormulasState(); // Persist changes
  return newFormula;
};

// Reset formulas to default data (useful for demo purposes)
export const resetFormulasToDefault = () => {
  formulasState = [...formulasData];
  saveFormulasState();
  return formulasState;
}; 