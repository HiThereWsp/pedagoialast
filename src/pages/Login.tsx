import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { LoginForm } from "@/components/landing/LoginForm"
import { Card, CardContent } from "@/components/ui/card"
import { SEO } from "@/components/SEO"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"

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
      <div className="flex min-h-screen flex-col items-center justify-between bg-background">
        <div className="w-full flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <LoginForm />
            </CardContent>
          </Card>
        </div>
        
        {/* Footer */}
        <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 PedagoIA. Tous droits réservés.
            </p>
            <div className="space-x-4">
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                Tarifs
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}