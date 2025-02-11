import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { LoginForm } from "@/components/landing/LoginForm"
import { Card, CardContent } from "@/components/ui/card"
import { SEO } from "@/components/SEO"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"
import { ForgotPasswordForm } from "@/components/landing/auth/ForgotPassowrdForm";

export default function ForgotPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [tokenError, setTokenError] = useState(false)
  
  useEffect(() => {
    const verifyMagicLink = async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const error = hashParams.get("error");
      const error_code = hashParams.get("error_code");
      const errorDescription = hashParams.get("error_description");

      if (accessToken && refreshToken) {
        console.log("Access Token:", accessToken);
        console.log("Refresh Token:", refreshToken);

        try {
          const { data: setSessionData, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            console.error("Error setting session:", setSessionError.message);
          } else {
            setIsLoading(false)
            console.log("Session set successfully:", setSessionData);
          }
        } catch (err) {
          console.error("Unexpected error during session setting:", err);
        }
      } else if (error_code) {
        setIsLoading(false)
        setTokenError(true)
        console.log("No access token or refresh token found in the URL.");
      } else {
        console.log("No access token or refresh token found in the URL.");
      }
    };

    verifyMagicLink();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <img 
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
            alt="PedagoIA Logo" 
            className="w-[100px] h-[120px] object-contain mx-auto mb-4" 
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Mot de passe oublié | PedagoIA - Assistant pédagogique intelligent"
        description="Réinitialisez votre mot de passe PedagoIA pour récupérer l'accès à votre compte."
      />
      <div className="flex min-h-screen flex-col items-center justify-between bg-background">
        <div className="w-full flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <img 
                src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                alt="PedagoIA Logo" 
                className="w-[100px] h-[120px] object-contain mx-auto mb-4" 
              />
            </div>
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <ForgotPasswordForm />
              </CardContent>
            </Card>
          </div>
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
