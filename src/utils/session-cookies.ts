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
  
  try {
    // Pour le débogage initial
    console.log("Écriture des cookies de session partagés");
    
    // Détecter si on est en localhost pour le développement ou en production
    const domain = window.location.hostname === 'localhost' 
      ? 'localhost' 
      : '.pedagoia.fr';
    
    // Utilisez le format correct de cookie pour supabase avec l'ID de projet
    // Ceci est important pour la compatibilité avec Next.js
    const authTokenName = 'sb-jpelncawdaounkidvymu-auth-token';
    
    // Définir le cookie d'accès partagé
    if (session.access_token) {
      document.cookie = `${authTokenName}=${session.access_token}; Path=/; Domain=${domain}; ${window.location.protocol === 'https:' ? 'Secure; SameSite=Lax' : ''}; Max-Age=${60 * 60 * 24 * 7}`; // 7 jours
      
      console.error("AUTH_DEBUG: Cookie écrit pour session partagée", {
        token: session.access_token?.substring(0, 10) + '...',
        domain
      });
    }
    
    // Définir le cookie de rafraîchissement partagé
    if (session.refresh_token) {
      document.cookie = `sb-refresh-token=${session.refresh_token}; Path=/; Domain=${domain}; ${window.location.protocol === 'https:' ? 'Secure; SameSite=Lax' : ''}; Max-Age=${60 * 60 * 24 * 30}`; // 30 jours
    }
    
    // Ajouter aussi l'ID utilisateur peut être utile pour des vérifications rapides
    if (session.user?.id) {
      document.cookie = `sb-user-id=${session.user.id}; Path=/; Domain=${domain}; ${window.location.protocol === 'https:' ? 'Secure; SameSite=Lax' : ''}; Max-Age=${60 * 60 * 24 * 30}`;
    }
    
    // Stockez également en localStorage pour la détection par Next.js
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at
    }));
  } catch (err) {
    console.error("Erreur lors de l'écriture des cookies partagés:", err);
  }
};

/**
 * Nettoie les cookies de session partagés lors de la déconnexion
 */
export const clearSharedSessionCookies = () => {
  try {
    console.log("Nettoyage des cookies de session partagés");
    
    // Supprimez sur tous les domaines possibles pour assurer un nettoyage complet
    const domains = [undefined, '', '.pedagoia.fr', 'app.pedagoia.fr', 'www.pedagoia.fr', 'localhost'];
    const authTokenName = 'sb-jpelncawdaounkidvymu-auth-token';
    
    domains.forEach(domain => {
      const domainStr = domain ? `; domain=${domain}` : '';
      document.cookie = `${authTokenName}=; path=/; max-age=0${domainStr}`;
      document.cookie = `sb-refresh-token=; path=/; max-age=0${domainStr}`;
      document.cookie = `sb-user-id=; path=/; max-age=0${domainStr}`;
      document.cookie = `sb-access-token=; path=/; max-age=0${domainStr}`;
    });
    
    // Nettoyez également le localStorage
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.expires_at');
    localStorage.removeItem('subscription_status');
    
    console.error("AUTH_DEBUG: Cookies et localStorage nettoyés");
  } catch (err) {
    console.error("Erreur lors du nettoyage des cookies partagés:", err);
  }
};