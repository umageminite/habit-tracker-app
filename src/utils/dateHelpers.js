/**
 * Date utility functions for habit tracking
 */

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

/**
 * Check if a date string is today
 */
export function isToday(dateString) {
  if (!dateString) return false;
  return dateString === getTodayString();
}

/**
 * Check if a date string is yesterday
 */
export function isYesterday(dateString) {
  if (!dateString) return false;
  return dateString === getYesterdayString();
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1String, date2String) {
  const d1 = new Date(date1String);
  const d2 = new Date(date2String);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if streak should continue
 * Streak continues if last completed was today or yesterday
 */
export function shouldContinueStreak(lastCompletedAt) {
  if (!lastCompletedAt) return false;
  return isToday(lastCompletedAt) || isYesterday(lastCompletedAt);
}

/**
 * Calculate streak based on completion history
 * For proper streak calculation, you'd need full history
 * This is a simplified version
 */
export function calculateStreak(lastCompletedAt, currentStreak) {
  if (!lastCompletedAt) return 0;

  if (isToday(lastCompletedAt)) {
    // Already completed today, return current streak
    return currentStreak;
  }

  if (isYesterday(lastCompletedAt)) {
    // Completed yesterday, streak continues
    return currentStreak;
  }

  // More than 1 day gap, streak is broken
  return 0;
}

/**
 * Get start of day timestamp
 */
export function getStartOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Check if we've crossed into a new day since last check
 */
export function hasNewDayStarted(lastCheckDate) {
  if (!lastCheckDate) return true;
  const lastCheck = new Date(lastCheckDate);
  const now = new Date();
  return getStartOfDay(now).getTime() > getStartOfDay(lastCheck).getTime();
}
