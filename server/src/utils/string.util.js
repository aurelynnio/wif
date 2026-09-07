/**
 * Escapes special regex characters in a string to safely use in RegExp constructors or MongoDB queries.
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for regex
 */
export const escapeRegex = (str = '') => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default {
  escapeRegex,
};

