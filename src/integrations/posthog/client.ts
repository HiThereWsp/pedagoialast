import posthog from 'posthog-js'

// Initialisation de PostHog
export const initPostHog = () => {
  posthog.init(
    import.meta.env.VITE_POSTHOG_KEY || 'your-project-api-key',
    {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: false,
    }
  )
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