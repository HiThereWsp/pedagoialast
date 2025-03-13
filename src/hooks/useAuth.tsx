import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useLocation } from "react-router-dom"
import type { User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  loading: boolean
  authReady: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authReady: false
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
  const [authReady, setAuthReady] = useState(false)
  const authCheckCompleted = useRef(false)
  const { toast } = useToast()
  const location = useLocation()

  // Détermine si la page actuelle est une page publique (landing, login, etc.)
  const isPublicPage = () => {
    const publicPaths = [
      // Pages d'accueil et landing
      '/', 
      '/bienvenue',
      '/waiting-list',
      
      // Pages d'authentification
      '/login', 
      '/signup', 
      '/forgot-password',
      '/reset-password',
      '/confirm-email',
      
      // Pages d'information
      '/contact', 
      '/pricing',
      
      // Pages légales
      '/terms',
      '/privacy',
      '/legal'
    ]
    return publicPaths.some(path => location.pathname.startsWith(path))
  }

  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null

    // Vérifie la session initiale avec une gestion d'erreur silencieuse pour les pages publiques
    const checkUser = async () => {
      try {
        console.log("Démarrage de la vérification d'authentification...")
        
        // Pour éviter les multiples vérifications
        if (authCheckCompleted.current) {
          console.log("Vérification d'auth déjà effectuée, ignorée")
          return
        }
        
        // Sur les pages publiques, définir authReady = true immédiatement
        // pour éviter les vérifications de session non nécessaires
        if (isPublicPage()) {
          console.log("Page publique détectée, vérification minimale")
          setAuthReady(true)
          setLoading(false)
          authCheckCompleted.current = true
          return
        }
        
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
          authCheckCompleted.current = true
          setAuthReady(true)
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

    // Écoute les changements d'authentification avec gestion adaptée des erreurs
    const setupAuthListener = async () => {
      try {
        await checkUser()
        
        if (mounted) {
          // N'abonnez aux changements d'authentification que si ce n'est pas une page publique
          // ou si l'utilisateur est déjà connecté
          const { data } = supabase.auth.onAuthStateChange(
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
                setAuthReady(true)
              }
            }
          )
          
          subscription = data.subscription
        }
      } catch (err) {
        console.error("Erreur dans setupAuthListener:", err)
        if (mounted) {
          setLoading(false)
          setAuthReady(true)
        }
      }
    }

    setupAuthListener()

    return () => {
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [toast, location.pathname])

  // Amélioration de la gestion du chargement pour éviter de bloquer l'UI sur les pages publiques
  if (loading) {
    // Sur les pages publiques, afficher le contenu même pendant le chargement
    if (isPublicPage()) {
      return (
        <AuthContext.Provider value={{ user: null, loading: true, authReady: false }}>
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
    <AuthContext.Provider value={{ user, loading, authReady }}>
      {children}
    </AuthContext.Provider>
  )
}
        
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
          authCheckCompleted.current = true
          setAuthReady(true)
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

    // Écoute les changements d'authentification avec gestion adaptée des erreurs
    const setupAuthListener = async () => {
      try {
        await checkUser()
        
        if (mounted) {
          // N'abonnez aux changements d'authentification que si ce n'est pas une page publique
          // ou si l'utilisateur est déjà connecté
          const { data } = supabase.auth.onAuthStateChange(
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
                setAuthReady(true)
              }
            }
          )
          
          subscription = data.subscription
        }
      } catch (err) {
        console.error("Erreur dans setupAuthListener:", err)
        if (mounted) {
          setLoading(false)
          setAuthReady(true)
        }
      }
    }

    setupAuthListener()

    return () => {
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [toast, location.pathname])

  // Amélioration de la gestion du chargement pour éviter de bloquer l'UI sur les pages publiques
  if (loading) {
    // Sur les pages publiques, afficher le contenu même pendant le chargement
    if (isPublicPage()) {
      return (
        <AuthContext.Provider value={{ user: null, loading: true, authReady: false }}>
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
    <AuthContext.Provider value={{ user, loading, authReady }}>
      {children}
    </AuthContext.Provider>
  )
}
