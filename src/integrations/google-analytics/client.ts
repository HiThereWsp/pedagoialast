
// Configuration de Google Analytics
const GA_TRACKING_ID = 'qAS5OCTURaCmQ1IfJY2ScQ';

// Initialisation de GA4 avec gestion du consentement et cross-domain tracking
export const initGA = (hasConsent: boolean = false) => {
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
    cookie_expires: 63072000, // 2 years in seconds
    send_page_view: true,
    // Enable cross-domain tracking with Stripe Checkout
    linker: {
      domains: ['pedagoia.fr', 'checkout.stripe.com']
    }
  });

  // Configuration du tracking des conversions Google Ads
  gtag('config', 'AW-16957927011', {
    linker: {
      domains: ['pedagoia.fr', 'checkout.stripe.com']
    }
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

// Fonction pour suivre les conversions d'achat
export const trackPurchaseConversion = (
  transactionId: string,
  value: number,
  currency: string = 'EUR',
  subscriptionType?: string,
  clientId?: string
) => {
  if (typeof window.gtag !== 'undefined') {
    // Track Google Ads conversion
    window.gtag('event', 'conversion', {
      'send_to': 'AW-16957927011/c3kwCIzhyrAaEOPclZY_',
      'value': value,
      'currency': currency,
      'transaction_id': transactionId,
    });
    
    // Track GA4 purchase event
    window.gtag('event', 'purchase', {
      'transaction_id': transactionId,
      'value': value,
      'currency': currency,
      'items': [
        {
          'item_name': subscriptionType ? `Abonnement PedagoIA (${subscriptionType})` : 'Abonnement PedagoIA',
          'item_id': subscriptionType || 'default',
          'price': value,
          'quantity': 1
        }
      ],
      ...(clientId && { 'client_id': clientId })
    });
  }
};
