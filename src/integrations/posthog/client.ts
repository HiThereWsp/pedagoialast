import posthog from 'posthog-js'

// Initialisation de PostHog
export const initPostHog = () => {
  if (typeof window !== 'undefined') { // Vérification que nous sommes côté client
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
          cross_subdomain_cookie: false,
          xhr_headers: {
            'timeout': '5000' // 5 second timeout
          },
          on_xhr_error: (error) => {
            // Log the error but don't break the application
            console.warn('PostHog request failed:', error)
          }
        }
      )
    } catch (error) {
      // Log initialization error but don't break the application
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