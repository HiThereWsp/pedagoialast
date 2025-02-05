import posthog from 'posthog-js'

// Initialisation de PostHog
export const initPostHog = () => {
  // Ne pas initialiser PostHog en développement sauf si forcé
  if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_FORCE_ANALYTICS) {
    console.log('PostHog disabled in development')
    return
  }

  if (typeof window !== 'undefined') {
    try {
      posthog.init(
        import.meta.env.VITE_POSTHOG_KEY || '',
        {
          api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com',
          loaded: (posthog) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('PostHog loaded:', posthog)
            }
          },
          capture_pageview: false, // On désactive la capture automatique pour la gérer nous-mêmes
          capture_pageleave: true,
          autocapture: true,
          persistence: 'localStorage',
          disable_session_recording: true,
          cross_subdomain_cookie: false,
          enable_recording_console_log: false,
          debug: process.env.NODE_ENV === 'development'
        }
      )

      // Vérifier que PostHog est bien initialisé
      if (!posthog.__loaded) {
        console.warn('PostHog not loaded properly')
        return
      }

      console.log('PostHog initialized successfully')

    } catch (error) {
      console.warn('PostHog initialization failed:', error)
    }
  }
}

// Événements personnalisés pour la page de tarification
export const pricingEvents = {
  viewPricing: () => {
    try {
      if (!posthog.__loaded) return
      posthog.capture('pricing_page_viewed')
    } catch (error) {
      console.warn('Failed to capture pricing view event:', error)
    }
  },
  selectPlan: (planType: 'free' | 'premium' | 'enterprise') => {
    try {
      if (!posthog.__loaded) return
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
      if (!posthog.__loaded) return
      posthog.capture('free_trial_started', {
        plan_type: planType,
        location: 'pricing_page'
      })
    } catch (error) {
      console.warn('Failed to capture trial start event:', error)
    }
  }
}

// Export posthog instance for direct usage
export { posthog }