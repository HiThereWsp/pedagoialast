import posthog from 'posthog-js'

// Initialize PostHog function
export const initPostHog = () => {
  posthog.init(import.meta.env.VITE_POSTHOG_API_KEY || 'phc_7B1G2wgpXdvidRFgEMHyxlBzLyKcqzXvGGdVZgvQyMD', {
    api_host: 'https://eu.posthog.com',
    loaded: (posthog) => {
      if (import.meta.env.DEV) posthog.debug()
    },
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: true,
  })
}

// Export the PostHog instance
export { posthog }

// Pricing events
export const pricingEvents = {
  viewPricing: () => {
    posthog.capture('pricing_page_viewed')
  },
  selectPlan: (plan: string) => {
    posthog.capture('pricing_plan_selected', {
      plan,
      location: 'pricing_page'
    })
  }
}