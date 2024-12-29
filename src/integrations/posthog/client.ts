import posthog from 'posthog-js'

// Initialisation de PostHog
export const initPostHog = () => {
  // Ne pas initialiser PostHog en développement
  if (process.env.NODE_ENV === 'development') {
    console.log('PostHog disabled in development')
    return
  }

  if (typeof window !== 'undefined') {
    try {
      posthog.init(
        import.meta.env.VITE_POSTHOG_KEY,
        {
          api_host: import.meta.env.VITE_POSTHOG_HOST,
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
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
    } catch (error) {
      console.warn('PostHog initialization failed:', error)
    }
  }
}

// Événements personnalisés pour la page de tarification
export const pricingEvents = {
  viewPricing: () => {
    try {
      posthog.capture('pricing_page_viewed')
    } catch (error) {
      console.warn('Failed to capture pricing view event:', error)
    }
  },
  selectPlan: (planType: 'free' | 'premium' | 'enterprise') => {
    try {
      posthog.capture('pricing_plan_selected', {
        plan_type: planType,
        location: 'pricing_page'
      })
    } catch (error) {
      console.warn('Failed to capture plan selection event:', error)
    }
  },
  startTrial: (planType: 'premium' | 'enterprise') => {
    try {
      posthog.capture('free_trial_started', {
        plan_type: planType,
        location: 'pricing_page'
      })
    } catch (error) {
      console.warn('Failed to capture trial start event:', error)
    }
  }
}
