
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

export const FB_PIXEL_ID = '1148646506861774';

// Événements standards
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
  
  // Initier le checkout
  initiateCheckout: (plan: 'monthly' | 'yearly', price: number) => {
    event('InitiateCheckout', {
      content_name: `premium_${plan}`,
      value: price,
      currency: 'EUR',
      subscription_type: plan
    });
  },
  
  // Succès d'abonnement
  subscriptionSuccess: (plan: 'monthly' | 'yearly', price: number, yearlyValue: number) => {
    event('Subscribe', {
      content_name: `premium_${plan}`,
      content_category: 'subscription',
      currency: 'EUR',
      value: price,
      status: 'success',
      subscription_type: plan,
      predicted_ltv: yearlyValue
    });
  },
  
  // Échec d'abonnement
  subscriptionFailed: (plan: 'monthly' | 'yearly', price: number, errorType: string) => {
    event('Subscribe', {
      content_name: `premium_${plan}`,
      content_category: 'subscription',
      currency: 'EUR',
      value: price,
      status: 'failed',
      subscription_type: plan,
      error_type: errorType
    });
  },
  
  // Abandon du processus
  checkoutCanceled: (plan: 'monthly' | 'yearly') => {
    event('Subscribe', {
      content_name: `premium_${plan}`,
      content_category: 'subscription',
      status: 'abandoned',
      subscription_type: plan
    });
  },
  
  // Formulaire établissement
  schoolFormStep: (step: number) => {
    event('Lead', {
      content_name: step === 4 ? 'school_form_complete' : 'school_form_progress',
      content_category: 'school',
      step: `step_${step}`
    });
  },
  
  // Inscription
  signupStarted: () => {
    event('Lead', {
      content_name: 'signup_start',
      content_category: 'registration'
    });
  },
  
  signupCompleted: () => {
    event('CompleteRegistration', {
      content_name: 'signup_success',
      status: 'success'
    });
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

  console.log('[Facebook Pixel] Initializing with ID:', FB_PIXEL_ID);
  
  // Initialise avec votre ID Pixel
  window.fbq('init', FB_PIXEL_ID);
  
  // Track la première vue de page
  pageview();
};
