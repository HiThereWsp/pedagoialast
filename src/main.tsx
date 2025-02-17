
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import * as Sentry from "@sentry/react"
import { initializePixel } from './integrations/meta-pixel/client'

// Initialize Sentry
Sentry.init({
  dsn: "https://631c2e8cae63ff84d324d29965684bbf@o4508745877946368.ingest.us.sentry.io/4508745881747456",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Initialize Meta Pixel
initializePixel();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
