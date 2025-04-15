import posthog from 'posthog-js'

// Temporarily disable PostHog
const POSTHOG_DISABLED = false;

// Initialize PostHog with your project API key
if (typeof window !== 'undefined' && !POSTHOG_DISABLED) { // Check for browser environment
  posthog.init(
    import.meta.env.VITE_POSTHOG_KEY || '', 
    {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com',
      autocapture: true, // Enable autocapture for click and form events
      persistence: 'localStorage',
      capture_pageview: true, // Enable automatic pageview tracking
      capture_pageleave: true, // Enable tracking when users leave pages
      disable_session_recording: false, // Enable session recording
      cross_subdomain_cookie: false,
      enable_recording_console_log: true, // Enable console log recording for better debugging
      request_batching: true,
      bootstrap: {
        distinctID: 'anonymous',
        isIdentifiedID: false,
      }
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

// Create a mock posthog object when disabled
const mockPosthog = {
  capture: () => {},
  identify: () => {},
  reset: () => {},
  people: {
    set: () => {}
  },
  opt_out_capturing: () => {}
};

// Export the appropriate posthog instance
const exportedPosthog = POSTHOG_DISABLED ? mockPosthog : posthog;
export { exportedPosthog as posthog };
