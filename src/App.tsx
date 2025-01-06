import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from '@/components/ui/toaster'
import { HelmetProvider } from 'react-helmet-async'
import { SidebarProvider } from '@/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GlobalHeader } from '@/components/layout/GlobalHeader'

function App() {
  return (
    <HelmetProvider>
      <SidebarProvider>
        <TooltipProvider>
          <BrowserRouter>
            <GlobalHeader />
            <AppRoutes />
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </SidebarProvider>
    </HelmetProvider>
  )
}

export default App