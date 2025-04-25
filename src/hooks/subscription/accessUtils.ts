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
  console.log("Vérification email spécial:", normalizedEmail);
  
  const isSpecial = specialEmails.some(specialEmail => 
    specialEmail.toLowerCase().trim() === normalizedEmail
  );
  
  console.log("Résultat vérification email spécial:", { 
    email: normalizedEmail, 
    isSpecial, 
    matchedWith: isSpecial 
      ? specialEmails.find(e => e.toLowerCase().trim() === normalizedEmail) 
      : null 
  });
  
  return isSpecial;
};

/**
 * Override d'accès pour les administrateurs et développeurs
 * @param email Email à vérifier
 * @returns true si l'email a un accès prioritaire
 */
export const hasAdminAccess = (email: string | undefined | null): boolean => {
  if (!email) return false;
  
  // Vérification directe pour les emails critiques (évite tout problème de timing/cache)
  if (email.toLowerCase().trim() === 'andyguitteaud@gmail.com') {
    console.log("Accès admin accordé directement pour email critique:", email);
    return true;
  }
  
  const adminEmails = [
    'andyguitteaud@gmail.com', // Correction de la faute de frappe
    'ag.tradeunion@gmail.com',
    'moienseignant3.0@gmail.com'
  ];
  
  console.log("Vérification admin pour:", email);
  const result = isSpecialEmail(email, adminEmails);
  
  if (result) {
    // Stocker l'information en localStorage pour éviter les pertes d'accès
    try {
      localStorage.setItem('is_admin_user', 'true');
      localStorage.setItem('admin_email', email);
      console.log("Statut admin stocké en localStorage pour:", email);
    } catch (e) {
      console.error("Erreur lors du stockage du statut admin:", e);
    }
  }
  
  return result;
};

/**
 * Vérifie si l'utilisateur a un accès admin stocké localement
 * Utilisé comme fallback en cas d'échec de la vérification principale
 */
export const hasStoredAdminAccess = (): boolean => {
  try {
    return localStorage.getItem('is_admin_user') === 'true';
  } catch (e) {
    console.error("Erreur lors de la vérification du statut admin en localStorage:", e);
    return false;
  }
};
