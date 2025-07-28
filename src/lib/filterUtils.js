// Utility functions for filtering items by assignment
// Handles both UUID (string) and UUID[] (array) formats

/**
 * Check if a user is assigned to an item
 * @param {string|string[]|null} assignedTo - The assigned_to value from database
 * @param {string} userId - The user ID to check
 * @returns {boolean} - True if user is assigned to the item
 */
export const isUserAssigned = (assignedTo, userId) => {
  if (!assignedTo || !userId) return false;
  
  // Handle array format (UUID[])
  if (Array.isArray(assignedTo)) {
    return assignedTo.includes(userId);
  }
  
  // Handle string format (single UUID)
  if (typeof assignedTo === 'string') {
    return assignedTo === userId;
  }
  
  return false;
};

/**
 * Filter items by tab type (all, assigned, created)
 * @param {Array} items - Array of items to filter
 * @param {string} activeTab - The active tab ('all', 'assigned', 'created')
 * @param {Object} user - The current user object
 * @returns {Array} - Filtered array of items
 */
export const filterByTab = (items, activeTab, user) => {
  if (!items || items.length === 0) return [];
  
  return items.filter(item => {
    // Tab filter
    if (activeTab === 'assigned' && user) {
      return isUserAssigned(item.assigned_to, user.id);
    } else if (activeTab === 'created' && user) {
      return item.created_by === user.id;
    }
    // 'all' tab or no specific filter
    return true;
  });
};

/**
 * Enhanced filtering with debugging
 * @param {Array} items - Array of items to filter
 * @param {string} activeTab - The active tab ('all', 'assigned', 'created')
 * @param {Object} user - The current user object
 * @param {boolean} debug - Whether to log debug information
 * @returns {Array} - Filtered array of items
 */
export const filterByTabWithDebug = (items, activeTab, user, debug = false) => {
  if (!items || items.length === 0) return [];
  
  const filteredItems = [];
  
  items.forEach(item => {
    let shouldInclude = true;
    
    if (activeTab === 'assigned' && user) {
      shouldInclude = isUserAssigned(item.assigned_to, user.id);
      
      if (debug) {
        // Assignment check debug info
      }
    } else if (activeTab === 'created' && user) {
      shouldInclude = item.created_by === user.id;
      
      if (debug) {
        // Creation check debug info
      }
    }
    
    if (shouldInclude) {
      filteredItems.push(item);
    }
  });
  
  if (debug) {
    // Filtering results debug info
  }
  
  return filteredItems;
};

/**
 * Helper function to explain why assignment check passed/failed
 * @param {string|string[]|null} assignedTo - The assigned_to value
 * @param {string} userId - The user ID
 * @returns {string} - Explanation of the assignment check result
 */
const getAssignmentReason = (assignedTo, userId) => {
  if (!assignedTo) return 'assigned_to is null/undefined';
  if (!userId) return 'user_id is null/undefined';
  
  if (Array.isArray(assignedTo)) {
    if (assignedTo.length === 0) return 'assigned_to is empty array';
    if (assignedTo.includes(userId)) return 'user_id found in assigned_to array';
    return `user_id not in assigned_to array (has ${assignedTo.length} items: ${assignedTo.join(', ')})`;
  }
  
  if (typeof assignedTo === 'string') {
    if (assignedTo === userId) return 'assigned_to matches user_id (single UUID)';
    return 'assigned_to does not match user_id (single UUID)';
  }
  
  return `assigned_to has unexpected type: ${typeof assignedTo}`;
};

/**
 * Convert assigned_to field to consistent array format
 * @param {string|string[]|null} assignedTo - The assigned_to value from database
 * @returns {string[]} - Array of user IDs (empty array if none)
 */
export const normalizeAssignedTo = (assignedTo) => {
  if (!assignedTo) return [];
  
  if (Array.isArray(assignedTo)) {
    return assignedTo.filter(id => id && typeof id === 'string');
  }
  
  if (typeof assignedTo === 'string') {
    return [assignedTo];
  }
  
  return [];
};

/**
 * Check if two assignment arrays are equal
 * @param {string|string[]|null} a - First assignment value
 * @param {string|string[]|null} b - Second assignment value
 * @returns {boolean} - True if assignments are equal
 */
export const assignmentsEqual = (a, b) => {
  const arrayA = normalizeAssignedTo(a);
  const arrayB = normalizeAssignedTo(b);
  
  if (arrayA.length !== arrayB.length) return false;
  
  // Sort both arrays and compare
  const sortedA = [...arrayA].sort();
  const sortedB = [...arrayB].sort();
  
  return sortedA.every((val, index) => val === sortedB[index]);
}; 