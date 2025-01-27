import { Navigate, Outlet } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session error:", error)
          // En cas d'erreur de session, on nettoie
          await supabase.auth.signOut()
          localStorage.clear()
          setIsAuthenticated(false)
          toast({
            variant: "destructive",
            title: "Erreur de session",
            description: "Veuillez vous reconnecter.",
          })
          return
        }

        setIsAuthenticated(!!session)
      } catch (error) {
        console.error("Auth error:", error)
        setIsAuthenticated(false)
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Une erreur est survenue, veuillez vous reconnecter.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event)
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || !session) {
        setIsAuthenticated(false)
        localStorage.clear()
      } else {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [toast])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}