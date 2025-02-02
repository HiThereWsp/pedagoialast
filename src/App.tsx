import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from '@/components/ui/toaster'
import { HelmetProvider } from 'react-helmet-async'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouteTracker } from '@/components/analytics/RouteTracker'
import { MotionConfig } from 'framer-motion'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <SidebarProvider>
          <MotionConfig reducedMotion="user">
            <div className="flex min-h-screen w-full flex-col lg:flex-row">
              <TooltipProvider>
                <BrowserRouter>
                  <RouteTracker />
                  <main className="flex-1 w-full px-4 lg:px-8 py-4 lg:py-8">
                    <AppRoutes />
                  </main>
                  <Toaster />
                </BrowserRouter>
              </TooltipProvider>
            </div>
          </MotionConfig>
        </SidebarProvider>
      </HelmetProvider>
    </QueryClientProvider>
  )
}

export default App