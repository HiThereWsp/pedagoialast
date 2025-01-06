import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from '@/components/ui/toaster'
import { HelmetProvider } from 'react-helmet-async'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalHeader } from '@/components/layout/GlobalHeader'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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
          <div className="flex min-h-screen w-full">
            <TooltipProvider>
              <BrowserRouter>
                <GlobalHeader />
                <AppRoutes />
                <Toaster />
              </BrowserRouter>
            </TooltipProvider>
          </div>
        </SidebarProvider>
      </HelmetProvider>
    </QueryClientProvider>
  )
}

export default App