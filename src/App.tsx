import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from '@/components/ui/toaster'
import { HelmetProvider } from 'react-helmet-async'
import { SidebarProvider } from '@/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

function App() {
  return (
    <HelmetProvider>
      <TooltipProvider>
        <SidebarProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster />
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </HelmetProvider>
  )
}

export default App