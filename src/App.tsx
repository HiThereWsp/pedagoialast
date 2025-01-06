import { BrowserRouter as Router } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HelmetProvider } from 'react-helmet-async'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppRoutes } from "./routes/AppRoutes"
import "./App.css"

const queryClient = new QueryClient()

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <Toaster />
              <Sonner />
              <Router>
                <AppRoutes />
              </Router>
            </div>
          </SidebarProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App