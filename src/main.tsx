
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/toaster"
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Données considérées comme fraîches pendant 5 minutes
      gcTime: 1000 * 60 * 30, // Durée de conservation du cache
      refetchOnMount: false, // Ne pas refetch automatiquement au montage
      refetchOnWindowFocus: false, // Ne pas refetch quand la fenêtre reprend le focus
    },
  },
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>,
)
