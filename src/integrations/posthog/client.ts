import posthog from 'posthog-js'

// Initialisation de PostHog
export const initPostHog = () => {
  // Ne pas initialiser PostHog en développement sauf si forcé
  if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_FORCE_ANALYTICS) {
    console.log('PostHog disabled in development')
    return
  }

  console.log('Initializing PostHog...')
  console.log('Environment:', process.env.NODE_ENV)
  console.log('Force analytics:', import.meta.env.VITE_FORCE_ANALYTICS)

  if (typeof window !== 'undefined') {
    try {
      // Validate required environment variables
      const posthogKey = import.meta.env.VITE_POSTHOG_KEY
      if (!posthogKey) {
        console.error('PostHog key is missing')
        return
      }

      posthog.init(posthogKey, {
        api_host: 'https://app.posthog.com',  // Changed to use the main PostHog domain
        loaded: (posthog) => {
          console.log('PostHog loaded successfully')
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog instance:', posthog)
          }
        },
        capture_pageview: false, // We'll handle this manually
        capture_pageleave: true,
        autocapture: true,
        persistence: 'localStorage',
        disable_session_recording: true,
        cross_subdomain_cookie: false,
        enable_recording_console_log: false,
        debug: process.env.NODE_ENV === 'development',
        api_method: 'POST',
        bootstrap: {
          distinctID: 'user-id-' + Math.random(),
          isIdentifiedID: false
        },
        on_xhr_error: (xhr, url) => {
          console.error('PostHog XHR Error:', { url, status: xhr.status, response: xhr.responseText })
        }
      })

      // Vérifier que PostHog est bien initialisé
      if (!posthog.__loaded) {
        console.warn('PostHog not loaded properly')
        return
      }

      console.log('PostHog initialized successfully')

    } catch (error) {
      console.error('PostHog initialization failed:', error)
    }
  }
}

// Événements personnalisés pour la page de tarification
export const pricingEvents = {
  viewPricing: () => {
    try {
      if (!posthog.__loaded) {
        console.warn('PostHog not loaded, skipping pricing view event')
        return
      }
      posthog.capture('pricing_page_viewed')
      console.log('Captured pricing view event')
    } catch (error) {
      console.warn('Failed to capture pricing view event:', error)
    }
  },
  selectPlan: (planType: 'free' | 'premium' | 'enterprise') => {
    try {
      if (!posthog.__loaded) {
        console.warn('PostHog not loaded, skipping plan selection event')
        return
      }
      posthog.capture('pricing_plan_selected', {
        plan_type: planType,
        location: 'pricing_page'
      })
      console.log('Captured plan selection event:', planType)
    } catch (error) {
      console.warn('Failed to capture plan selection event:', error)
    }
  },
  startTrial: (planType: 'premium' | 'enterprise') => {
    try {
      if (!posthog.__loaded) {
        console.warn('PostHog not loaded, skipping trial start event')
        return
      }
      posthog.capture('free_trial_started', {
        plan_type: planType,
        location: 'pricing_page'
      })
      console.log('Captured trial start event:', planType)
    } catch (error) {
      console.warn('Failed to capture trial start event:', error)
    }
  }
}

// Export posthog instance for direct usage
export { posthog }