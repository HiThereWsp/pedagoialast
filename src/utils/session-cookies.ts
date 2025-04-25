/**
 * Utilitaires pour gérer les cookies de session partagés entre les domaines
 * pedagoia.fr et app.pedagoia.fr
 */

/**
 * Écrit les cookies de session Supabase avec le domaine .pedagoia.fr pour le partage entre sous-domaines
 * @param session La session Supabase active
 */
export const writeSharedSessionCookies = (session) => {
  if (!session) return;
  
  // Pour le débogage initial
  console.log("Écriture des cookies de session partagés");
  
  // Détecter si on est en localhost pour le développement
  const domain = window.location.hostname === 'localhost' 
    ? 'localhost' 
    : '.pedagoia.fr';
  
  // Utiliser à la fois le format spécifique à Supabase et notre format personnalisé pour assurer la compatibilité
  const authTokenName = 'sb-jpelncawdaounkidvymu-auth-token'; // Format Supabase
  
  // Définir le cookie d'accès partagé (format Supabase)
  if (session.access_token) {
    document.cookie = `${authTokenName}=${session.access_token}; Path=/; Domain=${domain}; ${window.location.protocol === 'https:' ? 'Secure; SameSite=Lax' : ''}; Max-Age=${60 * 60 * 24 * 7}`; // 7 jours
    
    // Format supplémentaire pour compatibilité
    document.cookie = `sb-access-token=${session.access_token}; Path=/; Domain=${domain}; ${window.location.protocol === 'https:' ? 'Secure; SameSite=Lax' : ''}; Max-Age=${60 * 60 * 24 * 7}`; // 7 jours
  }
  
  // Définir le cookie de rafraîchissement partagé
  if (session.refresh_token) {
    document.cookie = `sb-refresh-token=${session.refresh_token}; Path=/; Domain=${domain}; ${window.location.protocol === 'https:' ? 'Secure; SameSite=Lax' : ''}; Max-Age=${60 * 60 * 24 * 30}`; // 30 jours
  }
  
  // Ajouter aussi l'ID utilisateur peut être utile pour des vérifications rapides
  if (session.user?.id) {
    document.cookie = `sb-user-id=${session.user.id}; Path=/; Domain=${domain}; ${window.location.protocol === 'https:' ? 'Secure; SameSite=Lax' : ''}; Max-Age=${60 * 60 * 24 * 30}`;
  }
  
  // Stocker l'email de l'utilisateur pour les vérifications d'admin
  if (session.user?.email) {
    localStorage.setItem('last_user_email', session.user.email);
  }
};

/**
 * Nettoie les cookies de session partagés lors de la déconnexion
 */
export const clearSharedSessionCookies = () => {
  // Détecter si on est en localhost pour le développement
  const domain = window.location.hostname === 'localhost' 
    ? 'localhost' 
    : '.pedagoia.fr';
  
  console.log("Nettoyage des cookies de session partagés");

  // Format Supabase
  document.cookie = `sb-jpelncawdaounkidvymu-auth-token=; Max-Age=0; Path=/; Domain=${domain}`;
  
  // Nos formats personnalisés
  document.cookie = `sb-access-token=; Max-Age=0; Path=/; Domain=${domain}`;
  document.cookie = `sb-refresh-token=; Max-Age=0; Path=/; Domain=${domain}`;
  document.cookie = `sb-user-id=; Max-Age=0; Path=/; Domain=${domain}`;
  
  // Nettoyer aussi les cookies spécifiques à Supabase pour éviter les conflits
  document.cookie = 'supabase-auth-token=; Max-Age=0; Path=/;';
  
  // Nettoyage du localStorage
  localStorage.removeItem('last_user_email');
  localStorage.removeItem('is_admin_user');
};