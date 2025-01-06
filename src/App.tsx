import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from '@/components/ui/toaster'
import { HelmetProvider } from 'react-helmet-async'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalHeader } from '@/components/layout/GlobalHeader'

function App() {
  return (
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
  )
}

export default App