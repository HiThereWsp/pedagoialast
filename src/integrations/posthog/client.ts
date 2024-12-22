import posthog from 'posthog-js'

// Initialisation de PostHog
export const initPostHog = () => {
  if (typeof window !== 'undefined') { // Vérification que nous sommes côté client
    posthog.init(
      import.meta.env.VITE_POSTHOG_KEY,
      {
        api_host: import.meta.env.VITE_POSTHOG_HOST,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            // Ajout de logs en développement pour faciliter le debugging
            console.log('PostHog loaded:', posthog)
          }
        },
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,
        disable_session_recording: false,
        persistence: 'localStorage',
        cross_subdomain_cookie: false
      }
    )
  }
}

// Événements personnalisés pour la page de tarification
export const pricingEvents = {
  viewPricing: () => {
    posthog.capture('pricing_page_viewed')
  },
  selectPlan: (planType: 'free' | 'premium' | 'enterprise') => {
    posthog.capture('pricing_plan_selected', {
      plan_type: planType,
      location: 'pricing_page'
    })
  },
  startTrial: (planType: 'premium' | 'enterprise') => {
    posthog.capture('free_trial_started', {
      plan_type: planType,
      location: 'pricing_page'
    })
  }
}