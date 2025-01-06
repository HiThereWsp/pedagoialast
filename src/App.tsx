import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { Toaster } from '@/components/ui/toaster'
import { HelmetProvider } from 'react-helmet-async'
import { SidebarProvider } from '@/hooks/use-sidebar'

function App() {
  return (
    <HelmetProvider>
      <SidebarProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </SidebarProvider>
    </HelmetProvider>
  )
}

export default App