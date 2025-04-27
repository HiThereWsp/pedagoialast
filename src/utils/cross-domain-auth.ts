/**
 * Utilitaires pour la gestion de l'authentification cross-domaine entre
 * pedagoia.fr et app.pedagoia.fr
 */

/**
 * Synchronise l'état d'authentification via des cookies partagés
 * @param session Session Supabase active
 * @returns void
 */
export const syncAuthStateCrossDomain = (session) => {
  if (!session) return;
  
  try {
    // Préserver l'état actuel
    const currentSubscriptionStatus = localStorage.getItem('subscription_status');
    
    // Déterminer le domaine
    const domain = window.location.hostname === 'localhost' 
      ? 'localhost' 
      : '.pedagoia.fr';  // Le point est crucial pour le partage entre sous-domaines
    
    // Format commun pour Supabase
    const authTokenName = 'sb-jpelncawdaounkidvymu-auth-token';
    
    // Écrire le cookie de session principal
    if (session.access_token) {
      document.cookie = `${authTokenName}=${session.access_token}; Path=/; Domain=${domain}; Max-Age=604800; SameSite=Lax; ${location.protocol === 'https:' ? 'Secure' : ''}`;
      console.log(`Cookie d'authentification cross-domaine écrit pour ${domain}`);
    }
    
    // Ajouter aussi un cookie pour le token de rafraîchissement
    if (session.refresh_token) {
      document.cookie = `sb-refresh-token=${session.refresh_token}; Path=/; Domain=${domain}; Max-Age=2592000; SameSite=Lax; ${location.protocol === 'https:' ? 'Secure' : ''}`;
    }
    
    // Ne pas modifier le localStorage existant - Supabase en a besoin
  } catch (err) {
    console.error("Erreur lors de la synchronisation cross-domaine:", err);
  }
};

/**
 * Synchronise le statut d'abonnement via des cookies partagés
 * @returns void
 */
export const syncSubscriptionStateCrossDomain = () => {
  try {
    const subscriptionStatus = localStorage.getItem('subscription_status');
    if (!subscriptionStatus) return;
    
    const domain = window.location.hostname === 'localhost' 
      ? 'localhost' 
      : '.pedagoia.fr';
    
    // Stocker une version simplifiée dans un cookie
    const parsedStatus = JSON.parse(subscriptionStatus);
    const essentialStatus = {
      isActive: parsedStatus.isActive,
      type: parsedStatus.type,
      timestamp: parsedStatus.timestamp || Date.now()
    };
    
    document.cookie = `pd-subscription=${JSON.stringify(essentialStatus)}; Path=/; Domain=${domain}; Max-Age=86400; SameSite=Lax; ${location.protocol === 'https:' ? 'Secure' : ''}`;
    console.log(`Cookie de statut d'abonnement écrit pour ${domain}`);
  } catch (err) {
    console.error("Erreur synchronisation statut d'abonnement:", err);
  }
};

/**
 * Vérifie l'existence de cookies d'authentification cross-domaine
 * @returns {boolean} true si des cookies d'authentification existent
 */
export const checkCrossDomainAuth = () => {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const authTokenName = 'sb-jpelncawdaounkidvymu-auth-token';
    const authCookie = cookies.find(c => c.startsWith(`${authTokenName}=`));
    
    console.log("Vérification des cookies cross-domaine:", { 
      cookiesFound: cookies.length,
      authCookieFound: !!authCookie,
      cookies: cookies.map(c => c.split('=')[0])
    });
    
    return !!authCookie;
  } catch (err) {
    console.error("Erreur lors de la vérification des cookies cross-domaine:", err);
    return false;
  }
};

/**
 * Récupère le statut d'abonnement depuis les cookies si disponible
 * @returns {object|null} Statut d'abonnement ou null si non trouvé
 */
export const getSubscriptionStatusFromCookie = () => {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const subCookie = cookies.find(c => c.startsWith('pd-subscription='));
    
    if (subCookie) {
      const cookieValue = subCookie.split('=')[1];
      const cookieStatus = JSON.parse(decodeURIComponent(cookieValue));
      
      // Convertir en format complet pour compatibilité
      return {
        isActive: cookieStatus.isActive,
        type: cookieStatus.type,
        expiresAt: null,
        isLoading: false,
        error: null,
        retryCount: 0,
        timestamp: cookieStatus.timestamp
      };
    }
  } catch (err) {
    console.error("Erreur lecture cookie abonnement:", err);
  }
  
  return null;
};

/**
 * Nettoie tous les cookies d'authentification cross-domaine
 * @returns void
 */
export const clearCrossDomainAuth = () => {
  try {
    const domains = ['.pedagoia.fr', 'pedagoia.fr', 'app.pedagoia.fr', 'www.pedagoia.fr', 'localhost', ''];
    const authTokenName = 'sb-jpelncawdaounkidvymu-auth-token';
    
    domains.forEach(domain => {
      const domainStr = domain ? `; Domain=${domain}` : '';
      document.cookie = `${authTokenName}=; Path=/; Max-Age=0${domainStr}; SameSite=Lax; ${location.protocol === 'https:' ? 'Secure' : ''}`;
      document.cookie = `sb-refresh-token=; Path=/; Max-Age=0${domainStr}; SameSite=Lax; ${location.protocol === 'https:' ? 'Secure' : ''}`;
      document.cookie = `pd-subscription=; Path=/; Max-Age=0${domainStr}; SameSite=Lax; ${location.protocol === 'https:' ? 'Secure' : ''}`;
    });
    
    console.log("Cookies d'authentification cross-domaine nettoyés");
  } catch (err) {
    console.error("Erreur lors du nettoyage des cookies cross-domaine:", err);
  }
}; 