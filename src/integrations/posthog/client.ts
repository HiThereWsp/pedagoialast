
import posthog from 'posthog-js'

// Initialize PostHog with your project API key
if (typeof window !== 'undefined') { // Check for browser environment
  posthog.init(
    import.meta.env.VITE_POSTHOG_KEY || '', 
    {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com',
      autocapture: false,
      persistence: 'localStorage',
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true,
      cross_subdomain_cookie: false,
      enable_recording_console_log: true,
    }
  )

  // Disable PostHog in development unless explicitly enabled
  if (
    import.meta.env.DEV &&
    !import.meta.env.VITE_FORCE_ANALYTICS
  ) {
    posthog.opt_out_capturing()
  }
}

export { posthog }
