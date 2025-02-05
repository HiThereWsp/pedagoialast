import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { posthog } from '@/integrations/posthog/client'

export function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    // Capture pageview on route change
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        path: location.pathname,
        referrer: document.referrer,
        title: document.title
      })
      console.log('PostHog route change captured:', location.pathname)
    }
  }, [location])

  return null
}