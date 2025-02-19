
declare global {
  interface Window {
    fbq: any;
    _fbq: any; // Ajout de la déclaration manquante
  }
}

export const FB_PIXEL_ID = '1148646506861774';

export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Événements personnalisés
export const event = (name: string, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, options);
  }
};

// Initialisation de Meta Pixel
export const initializePixel = () => {
  if (typeof window === 'undefined') return;

  // Vérifie si fbq est déjà initialisé
  if (window.fbq) return;

  // Initialise fbq
  window.fbq = function() {
    window.fbq.callMethod ? 
      window.fbq.callMethod.apply(window.fbq, arguments) : 
      window.fbq.queue.push(arguments);
  };

  window._fbq = window.fbq;
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = '2.0';
  window.fbq.queue = [];

  // Charge le script Meta Pixel
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  // Initialise avec votre ID Pixel
  window.fbq('init', FB_PIXEL_ID);
  
  // Track la première vue de page
  pageview();
};
