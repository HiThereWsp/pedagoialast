
// Configuration de Google Analytics
const GA_TRACKING_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Initialisation de GA4 avec gestion du consentement
export const initGA = (hasConsent: boolean = false) => {
  if (!GA_TRACKING_ID) {
    console.warn('Google Analytics Measurement ID non défini');
    return;
  }

  if (!hasConsent) {
    console.log('Consentement cookies non obtenu pour Google Analytics');
    return;
  }

  // Création du script GA4
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
  
  // Ajout du script au head
  document.head.appendChild(script);

  // Initialisation de dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_TRACKING_ID, {
    cookie_domain: window.location.hostname,
    cookie_flags: 'SameSite=None;Secure',
    cookie_expires: 63072000,
    send_page_view: false // Désactivé par défaut pour contrôle manuel
  });

  // Rendre gtag disponible globalement
  window.gtag = gtag;
};

// Fonction pour envoyer des événements
export const sendGAEvent = (
  eventName: string,
  eventParams?: { [key: string]: any }
) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, eventParams);
  }
};

// Fonction pour envoyer une page vue
export const sendGAPageView = (path: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_path: path,
      send_to: GA_TRACKING_ID
    });
  }
};
