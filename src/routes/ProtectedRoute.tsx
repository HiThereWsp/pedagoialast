
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const location = useLocation()

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true)
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session error:", error)
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />
  }

  return <Outlet />
}
