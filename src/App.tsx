
import React, { Suspense } from 'react'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import AppRoutes from '@/routes/AppRoutes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'
import { BugReportButton } from '@/components/bug-report/BugReportButton'
import { LoadingIndicator } from '@/components/ui/loading-indicator'
import '@/App.css'

// Create a new QueryClient for the application
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Make sure errors don't crash the app
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Lazy loading wrapper component for better error handling
const LazyRoutes = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator size="lg" type="spinner" />
      </div>
    }>
      <AppRoutes />
    </Suspense>
  )
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <LazyRoutes />
            <Toaster />
            <BugReportButton />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
