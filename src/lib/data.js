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