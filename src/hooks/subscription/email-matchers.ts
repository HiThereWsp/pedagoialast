/**
 * Contains email and domain matching utilities for special access
 * This file is deprecated and will be removed once the transition to using 
 * only the beta_users table for beta access validation is complete.
 */

// Beta email list - deprecated, use beta_users table with is_validated=true instead
const betaEmails: string[] = [];

// Beta domains - deprecated, use beta_users table with is_validated=true instead
const betaDomains: string[] = [];

/**
 * Checks if an email is in the special beta access list
 * @deprecated Use checkBetaEmail from useBetaCheck instead
 */
export const isSpecialBetaEmail = (email: string): boolean => {
  if (!email) return false;
  // For backward compatibility, keep the function but return false
  // All beta checks should now go through the beta_users table
  return false;
};

/**
 * Checks if an email domain is in the special beta domains list
 * @deprecated Use checkBetaEmail from useBetaCheck instead
 */
export const isSpecialBetaDomain = (email: string): boolean => {
  if (!email) return false;
  // For backward compatibility, keep the function but return false
  // All beta checks should now go through the beta_users table
  return false;
};
