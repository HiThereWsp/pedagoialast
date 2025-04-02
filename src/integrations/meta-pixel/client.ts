
// Configuration des IDs de pixel pour différents objectifs
export const FB_PIXEL_IDS = {
  SUBSCRIBE: '934337045580399',      // Pour les événements d'abonnement
  SIGNUP: '1372093063957131',        // Pour les événements d'inscription
  SUCCESS: '3640356596263548'        // Pour la page de succès d'abonnement
};

// Événements standards
export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

// Événements personnalisés avec possibilité de cibler un pixel spécifique
export const event = (name: string, options = {}, pixelId?: string) => {
  if (typeof window !== 'undefined' && window.fbq) {
    if (pixelId) {
      window.fbq('trackSingle', pixelId, name, options);
    } else {
      window.fbq('track', name, options);
    }
  }
};

// Événements spécifiques pour notre funnel
export const facebookEvents = {
  // Landing page
  viewLanding: () => {
    event('ViewContent', { 
      content_name: 'landing_page',
      content_category: 'home'
    });
  },
  
  // Pricing
  viewPricing: () => {
    event('ViewContent', { 
      content_name: 'pricing_page',
      content_category: 'pricing'
    });
  },
  
  // Initier le checkout - Pixel SUBSCRIBE
  initiateCheckout: (plan: 'monthly' | 'yearly', price: number) => {
    event('InitiateCheckout', {
      content_name: `premium_${plan}`,
      value: price,
      currency: 'EUR',
      subscription_type: plan
    }, FB_PIXEL_IDS.SUBSCRIBE);
  },
  
  // Succès d'abonnement - Pixel SUCCESS
  subscriptionSuccess: (plan: 'monthly' | 'yearly', price: number, yearlyValue: number) => {
    event('Subscribe', {
      content_name: `premium_${plan}`,
      content_category: 'subscription',
      currency: 'EUR',
      value: price,
      status: 'success',
      subscription_type: plan,
      predicted_ltv: yearlyValue
    }, FB_PIXEL_IDS.SUCCESS);
  },
  
  // Échec d'abonnement - Pixel SUBSCRIBE
  subscriptionFailed: (plan: 'monthly' | 'yearly', price: number, errorType: string) => {
    event('Subscribe', {
      content_name: `premium_${plan}`,
      content_category: 'subscription',
      currency: 'EUR',
      value: price,
      status: 'failed',
      subscription_type: plan,
      error_type: errorType
    }, FB_PIXEL_IDS.SUBSCRIBE);
  },
  
  // Abandon du processus - Pixel SUBSCRIBE
  checkoutCanceled: (plan: 'monthly' | 'yearly') => {
    event('Subscribe', {
      content_name: `premium_${plan}`,
      content_category: 'subscription',
      status: 'abandoned',
      subscription_type: plan
    }, FB_PIXEL_IDS.SUBSCRIBE);
  },
  
  // Formulaire établissement
  schoolFormStep: (step: number) => {
    event('Lead', {
      content_name: step === 4 ? 'school_form_complete' : 'school_form_progress',
      content_category: 'school',
      step: `step_${step}`
    });
  },
  
  // Inscription - Pixel SIGNUP
  signupStarted: () => {
    event('Lead', {
      content_name: 'signup_start',
      content_category: 'registration'
    }, FB_PIXEL_IDS.SIGNUP);
  },
  
  signupCompleted: () => {
    event('CompleteRegistration', {
      content_name: 'signup_success',
      status: 'success'
    }, FB_PIXEL_IDS.SIGNUP);
  }
};

// Initialisation de Meta Pixel
export const initializePixel = () => {
  if (typeof window === 'undefined') return;

  // Vérifie si fbq est déjà initialisé
  if (window.fbq) return;

  // Initialise fbq
  window.fbq = function() {
    if (window.fbq.callMethod) {
      window.fbq.callMethod.apply(window.fbq, arguments);
    } else {
      window.fbq.queue.push(arguments);
    }
  };

  window._fbq = window.fbq;
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = '2.0';
  window.fbq.queue = [];

  console.log('[Facebook Pixel] Initializing multiple pixels');
  
  // Initialise avec les trois pixels
  window.fbq('init', FB_PIXEL_IDS.SUBSCRIBE);
  window.fbq('init', FB_PIXEL_IDS.SIGNUP);
  window.fbq('init', FB_PIXEL_IDS.SUCCESS);
  
  // Track la première vue de page
  pageview();
};
