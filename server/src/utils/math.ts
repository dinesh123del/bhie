/**
 * Pure mathematical utility functions.
 * Extracted from controllers to enforce single-responsibility and enable unit testing.
 */

/**
 * Round a number to 1 decimal place, treating non-finite values as 0.
 */
export function round(value: number): number {
  return Number((Number.isFinite(value) ? value : 0).toFixed(1));
}

/**
 * Clamp a number between min and max, treating non-finite values as min.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
}

/**
 * Estimate growth rate percentage between two periods.
 * Returns 100 if previous is 0 and current is positive.
 */
export function estimateGrowth(current: number, previous: number): number {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }
  return round(((current - previous) / previous) * 100);
}

/**
 * Compute the Z-score for a value relative to a dataset.
 * Returns 0 if stdDev is 0 (all values are identical).
 */
export function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Compute mean of an array of numbers.
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Compute standard deviation of an array of numbers.
 */
export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length);
}
