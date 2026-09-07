import { formatDistanceToNow as formatDfn } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format date to relative time string (Vietnamese) using date-fns
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 * @example
 * formatDistanceToNow(new Date()) // "vừa xong"
 * formatDistanceToNow(new Date(Date.now() - 3600000)) // "1 giờ trước"
 */
export const formatDistanceToNow = date => {
  if (!date) return '';

  try {
    const result = formatDfn(new Date(date), { addSuffix: true, locale: vi });
    // Map date-fns "dưới một phút trước" to the friendlier "vừa xong"
    return result === 'dưới một phút trước' ? 'vừa xong' : result;
  } catch {
    return '';
  }
};