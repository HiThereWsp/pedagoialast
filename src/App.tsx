import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HelmetProvider } from 'react-helmet-async'
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Settings from "@/pages/Settings"
import WaitlistLanding from "@/pages/WaitlistLanding"
import NotFound from "@/pages/NotFound"
import PricingPage from "@/pages/Pricing"
import "./App.css"

const queryClient = new QueryClient()

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/waitlist" element={<WaitlistLanding />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/chat" element={<Landing />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App