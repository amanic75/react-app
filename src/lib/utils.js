// Shared utility functions for the app

/**
 * Generate a slug/ID from a name (e.g., for materials, formulas).
 * @param {string} name - The name to convert
 * @returns {string} Slugified string
 */
export function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
} 