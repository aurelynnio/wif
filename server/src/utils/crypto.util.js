import crypto from 'node:crypto';

/**
 * Generate cryptographically secure random token in hex format
 * @param {number} [bytes=32] - Number of random bytes
 * @returns {string} Hexadecimal string
 */
export const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a string/token using SHA-256
 * @param {string} token - Raw string or token to hash
 * @returns {string} SHA-256 hex digest
 */
export const hashToken = (token = '') => {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
};

/**
 * Generate a random UUID v4
 * @returns {string} UUID string
 */
export const generateUUID = () => {
  return crypto.randomUUID();
};

export default {
  generateRandomToken,
  hashToken,
  generateUUID,
};

