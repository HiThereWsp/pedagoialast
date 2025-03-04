
import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useLocation } from "react-router-dom"
import type { User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const location = useLocation()

  // Détermine si la page actuelle est une page publique (landing, login, etc.)
  const isPublicPage = () => {
    const publicPaths = ['/', '/login', '/signup', '/reset-password', '/contact', '/pricing', '/forgot-password']
    return publicPaths.includes(location.pathname)
  }

  useEffect(() => {
    let mounted = true

    // Vérifie la session initiale avec une gestion d'erreur silencieuse pour les pages publiques
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("Erreur lors de la vérification de l'utilisateur:", error)
          // Sur les pages publiques, ne pas afficher de toast d'erreur
          if (!isPublicPage() && mounted) {
            toast({
              title: "Erreur d'authentification",
              description: "Une erreur est survenue lors de la vérification de votre session.",
              variant: "destructive",
            })
          }
        }
        
        if (mounted) {
          setUser(user)
        }
      } catch (error) {
        console.error("Exception lors de la vérification de l'utilisateur:", error)
        // Sur les pages publiques, ne pas afficher de toast d'erreur
        if (!isPublicPage() && mounted) {
          toast({
            title: "Erreur d'authentification",
            description: "Une erreur est survenue lors de la vérification de votre session.",
            variant: "destructive",
          })
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkUser()

    // Écoute les changements d'authentification avec gestion adaptée des erreurs
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          console.log("Auth state changed:", event)
          if (session?.user) {
            console.log("Session active:", session.user.email)
          } else {
            console.log("Pas de session active")
          }
          
          setUser(session?.user ?? null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [toast, location.pathname])

  // Amélioration de la gestion du chargement pour éviter de bloquer l'UI sur les pages publiques
  if (loading) {
    // Sur les pages publiques, afficher le contenu même pendant le chargement
    if (isPublicPage()) {
      return (
        <AuthContext.Provider value={{ user: null, loading: true }}>
          {children}
        </AuthContext.Provider>
      )
    }
    
    // Sur les pages privées, montrer l'indicateur de chargement
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
