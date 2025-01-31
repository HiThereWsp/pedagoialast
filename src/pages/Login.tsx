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
    const verifyMagicLink = async () => {
      // Get the current URL's query parameters
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get("token_hash"); // Extract the token value

      if (token) {
        console.log("Token:", token);

        try {
          // Verify the OTP using Supabase
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "magiclink", // Adjust this based on your use case
          });

          if (error) {
            console.error("Error verifying magic link:", error.message);
          } else {
            console.log("Magic link verified successfully!");
            // Redirect the user to the dashboard or another page
            // window.location.href = "/home"; // Adjust redirect as needed
          }
        } catch (err) {
          console.error("Unexpected error during verification:", err);
        }
      } else {
        console.log("No token found in the URL.");
      }
    };

    verifyMagicLink();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true)
        console.log("Checking session...")
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session error:", error)
          await supabase.auth.signOut()
          localStorage.removeItem('sb-jpelncawdaounkidvymu-auth-token')
          toast({
            variant: "destructive",
            title: "Session expirée",
            description: "Veuillez vous reconnecter.",
          })
        } else if (session) {
          console.log("Active session found:", session)
          const returnUrl = location.state?.returnUrl || '/home'
          console.log("Redirecting to:", returnUrl)
          navigate(returnUrl, { replace: true })
        } else {
          console.log("No active session found")
        }
      } catch (error) {
        console.error("Auth error:", error)
        await supabase.auth.signOut()
        localStorage.removeItem('sb-jpelncawdaounkidvymu-auth-token')
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session)
      
      if (event === 'SIGNED_IN' && session) {
        console.log("User signed in, redirecting...")
        const returnUrl = location.state?.returnUrl || '/home'
        console.log("Redirecting to:", returnUrl)
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