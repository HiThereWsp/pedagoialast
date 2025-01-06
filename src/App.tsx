import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HelmetProvider } from 'react-helmet-async'
import Index from "@/pages/Index"
import Login from "@/pages/Login"
import Settings from "@/pages/Settings"
import WaitlistLanding from "@/pages/WaitlistLanding"
import NotFound from "@/pages/NotFound"
import PricingPage from "@/pages/Pricing"
import { LessonPlanPage } from "@/pages/LessonPlanPage"
import { useEffect, useState } from "react"
import { supabase } from "./integrations/supabase/client"
import "./App.css"

const queryClient = new QueryClient()

// Composant pour protéger les routes authentifiées
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier la session au chargement
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Session error:", error)
          setIsAuthenticated(false)
        } else {
          setIsAuthenticated(!!session)
        }
      } catch (error) {
        console.error("Auth error:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session)
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Afficher un état de chargement pendant la vérification
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  }

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
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/creersequence" element={
                <ProtectedRoute>
                  <LessonPlanPage />
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