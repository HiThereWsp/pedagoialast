import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from '@/components/ui/toaster'
import { HelmetProvider } from 'react-helmet-async'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

function App() {
  return (
    <HelmetProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <TooltipProvider>
            <BrowserRouter>
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