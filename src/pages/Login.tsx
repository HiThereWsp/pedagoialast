import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { LoginForm } from "@/components/landing/LoginForm"
import { Card, CardContent } from "@/components/ui/card"
import { SEO } from "@/components/SEO"
import { useToast } from "@/components/ui/use-toast"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session error:", error)
          if (error.message.includes("refresh_token")) {
            await supabase.auth.signOut()
            toast({
              variant: "destructive",
              title: "Session expirée",
              description: "Veuillez vous reconnecter.",
            })
          }
        } else if (session) {
          // Si l'utilisateur est déjà connecté, on le redirige
          const returnUrl = location.state?.returnUrl || '/home'
          navigate(returnUrl, { replace: true })
        }
      } catch (error) {
        console.error("Auth error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session)
      
      if (event === 'SIGNED_IN' && session) {
        const returnUrl = location.state?.returnUrl || '/home'
        navigate(returnUrl, { replace: true })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate, location.state, toast])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  }

  return (
    <>
      <SEO 
        title="Connexion | PedagoIA - Assistant pédagogique intelligent"
        description="Connectez-vous à votre compte PedagoIA pour accéder à votre assistant pédagogique personnel et optimiser votre enseignement."
      />
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </>
  )
}