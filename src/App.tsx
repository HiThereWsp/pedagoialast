import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
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
import { useEffect, useState } from "react"
import { supabase } from "./integrations/supabase/client"
import "./App.css"

const queryClient = new QueryClient()

// Composant pour protéger les routes authentifiées
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Afficher null pendant la vérification
  if (isAuthenticated === null) return null

  // Rediriger vers la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<WaitlistLanding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/waitlist" element={<WaitlistLanding />} />
              <Route path="/pricing" element={<PricingPage />} />
              
              {/* Routes protégées */}
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Landing />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App