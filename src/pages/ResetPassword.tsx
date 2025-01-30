import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { LoginForm } from "@/components/landing/LoginForm"
import { Card, CardContent } from "@/components/ui/card"
import { SEO } from "@/components/SEO"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"
import {PasswordResetForm} from "@/components/landing/auth/PasswordResetForm.tsx";

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [tokenError, setTokenError] = useState(false)
  useEffect(() => {
    const verifyMagicLink = async () => {
      // Get the current URL's hash and query parameters
      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1)); // To get the values after the #

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const error = hashParams.get("error");
      const error_code = hashParams.get("error_code");
      const errorDescription = hashParams.get("error_description");


      if (accessToken && refreshToken) {
        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);

        try {
          // Set the session with the access and refresh tokens
          const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            console.error("Error setting session:", setSessionError.message);
          } else {
            setIsLoading(false)
            console.log("Session set successfully:", setSessionData);
            // Redirect or perform actions after setting session
            // window.location.href = "/dashboard"; // Adjust redirect as needed
          }
        } catch (err) {
          console.error("Unexpected error during session setting:", err);
        }
      }else if(error_code){
        setIsLoading(false)
        setTokenError(true)
        console.log("No access token or refresh token found in the URL.");
      }
      else {
        console.log("No access token or refresh token found in the URL.");
      }
    };

    verifyMagicLink();
  }, []);

  // useEffect(() => {
  //   const checkUser = async () => {
  //     try {
  //       const { data: { session }, error } = await supabase.auth.getSession()
  //
  //       if (error) {
  //         console.error("Session error:", error)
  //         if (error.message.includes("refresh_token")) {
  //           await supabase.auth.signOut()
  //           toast({
  //             variant: "destructive",
  //             title: "Session expirée",
  //             description: "Veuillez vous reconnecter.",
  //           })
  //         }
  //       } else if (session) {
  //         // Si l'utilisateur est déjà connecté, on le redirige
  //         const returnUrl = location.state?.returnUrl || '/home'
  //         navigate(returnUrl, { replace: true })
  //       }
  //     } catch (error) {
  //       console.error("Auth error:", error)
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }
  //
  //   checkUser()
  //
  //   // Écouter les changements d'état d'authentification
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     console.log("Auth state changed:", event, session)
  //
  //     if (event === 'SIGNED_IN' && session) {
  //       const returnUrl = location.state?.returnUrl || '/home'
  //       navigate(returnUrl, { replace: true })
  //     }
  //   })
  //
  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [navigate, location.state, toast])

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
              {!tokenError ? <PasswordResetForm />: <>
              <p>Token is missing or expired. Please try again.</p>
              </>}
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