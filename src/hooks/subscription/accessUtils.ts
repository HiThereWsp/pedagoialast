
/**
 * Utilitaire pour ajouter un timeout aux promesses
 * @param promise La promesse à exécuter
 * @param timeoutMs Le timeout en millisecondes
 * @param errorMessage Le message d'erreur en cas de timeout
 * @returns Le résultat de la promesse ou une erreur si timeout
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
    
    promise
      .then((result) => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
  });
};

/**
 * Vérification de l'email dans une liste d'emails spéciaux
 * @param email Email à vérifier
 * @param specialEmails Liste d'emails spéciaux
 * @returns true si l'email est dans la liste
 */
export const isSpecialEmail = (
  email: string | undefined | null,
  specialEmails: string[]
): boolean => {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase().trim();
  return specialEmails.some(specialEmail => 
    specialEmail.toLowerCase().trim() === normalizedEmail
  );
};

/**
 * Override d'accès pour les administrateurs et développeurs
 * @param email Email à vérifier
 * @returns true si l'email a un accès prioritaire
 */
export const hasAdminAccess = (email: string | undefined | null): boolean => {
  const adminEmails = [
    'andyguitteaud@gmail.com',
    'andyguitteaud@gmail.co',
    'ag.tradeunion@gmail.com',
    'moienseignant3.0@gmail.com'
  ];
  
  return isSpecialEmail(email, adminEmails);
};
