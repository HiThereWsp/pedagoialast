
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

// Fonction utilitaire de debounce pour limiter les appels fréquents
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  const debounced = (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const authCheckCompleted = useRef(false)
  const previousSession = useRef<any>(null)
  const { toast } = useToast()
  const location = useLocation()

  // Détermine si la page actuelle est une page publique (landing, login, etc.)
  const isPublicPage = () => {
    const publicPaths = [
      // Pages d'accueil et landing
      '/', 
      '/bienvenue',
      
      // Pages d'authentification
      '/login', 
      '/signup', 
      '/forgot-password',
      '/reset-password',
      '/confirm-email',
      
      // Pages d'information
      '/contact', 
      '/pricing',
      '/guide',
      
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
        
        // Utiliser le debounce pour la vérification de session
        const checkSession = debounce(async () => {
          const { data, error } = await supabase.auth.getUser()
          
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
          
          // Comparer avec la session précédente pour éviter les mises à jour inutiles
          const currentUserJSON = JSON.stringify(data.user);
          const previousUserJSON = previousSession.current ? JSON.stringify(previousSession.current) : null;
          
          if (currentUserJSON !== previousUserJSON) {
            previousSession.current = data.user;
            
            if (mounted) {
              setUser(data.user)
              authCheckCompleted.current = true
              setAuthReady(true)
              setLoading(false)
            }
          } else {
            if (mounted) {
              // Même si la session n'a pas changé, marquer comme prêt
              authCheckCompleted.current = true
              setAuthReady(true)
              setLoading(false)
            }
          }
        }, 1000); // Debounce de 1 seconde
        
        checkSession();
        
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
        
        if (mounted) {
          setLoading(false)
          setAuthReady(true)
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
                  
                  // Vérification spécifique pour l'utilisateur problématique
                  if (session.user.email === 'andyguitteaud@gmail.co') {
                    console.log("[DEBUG] Changement d'état auth pour utilisateur problématique:", {
                      event,
                      email: session.user.email,
                      id: session.user.id,
                      tokenExpiry: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A'
                    });
                  }
                  
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
  }

  return (
    <AuthContext.Provider value={{ user, loading, authReady }}>
      {children}
    </AuthContext.Provider>
  )
}
