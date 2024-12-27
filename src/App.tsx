import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { HelmetProvider } from 'react-helmet-async'
import Index from "./pages/Index"
import Login from "./pages/Login"
import Landing from "./pages/Landing"
import Pricing from "./pages/Pricing"
import Settings from "./pages/Settings"

const queryClient = new QueryClient()

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/chat" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/settings" element={<Settings />} />
              {/* Redirect /index to /chat */}
              <Route path="/index" element={<Navigate to="/chat" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App