import React, { useEffect, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import AppRoutes from '@/routes/AppRoutes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import '@/App.css'
import { SuggestionButton } from '@/components/feedback'
import { BugReportButton } from '@/components/bug-report/BugReportButton'
import StandalonePromoBanner from '@/components/common/StandalonePromoBanner'

// Create a client with more retries for better resilience
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

// Composant pour l'affichage conditionnel des boutons flottants
function FloatingButtons() {
  const location = useLocation();
  const [shouldShowSuggestion, setShouldShowSuggestion] = useState(true);
  
  useEffect(() => {
    // Liste des chemins où le bouton de suggestion doit être masqué
    const excludedPaths = ['/correspondence', '/plan-de-classe'];
    const currentPath = location.pathname;
    
    // Vérifier si le chemin actuel fait partie des exclusions
    const shouldShow = !excludedPaths.some(path => currentPath === path);
    setShouldShowSuggestion(shouldShow);
  }, [location.pathname]);
  
  return (
    <>
      <BugReportButton />
      {shouldShowSuggestion && <SuggestionButton />}
    </>
  );
}

function AppContent() {
  return (
    <>
      <StandalonePromoBanner />
      <AppRoutes />
      <Toaster />
      <FloatingButtons />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary fallback={<div className="p-8 text-center">Une erreur est survenue. Merci de rafraîchir la page.</div>}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App
