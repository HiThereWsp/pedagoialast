
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import AppRoutes from '@/routes/AppRoutes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'
import '@/App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
          {/* Déplacé en dehors de AuthProvider pour éviter les cycles de dépendance */}
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
