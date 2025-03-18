
/**
 * Contains email and domain matching utilities for special access
 */

// Beta email list
const betaEmails = [
  'andyguitteaud@gmail.co', 
  'andyguitteaud@gmail.com',
];

// Beta domains
const betaDomains = ['gmail.com', 'pedagogia.fr', 'gmail.fr', 'outlook.fr', 'outlook.com'];

/**
 * Checks if an email is in the special beta access list
 */
export const isSpecialBetaEmail = (email: string): boolean => {
  if (!email) return false;
  return betaEmails.includes(email);
};

/**
 * Checks if an email domain is in the special beta domains list
 */
export const isSpecialBetaDomain = (email: string): boolean => {
  if (!email) return false;
  const emailDomain = email.split('@')[1];
  return betaDomains.includes(emailDomain);
};
