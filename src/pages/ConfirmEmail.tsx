
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AuthType = "signup" | "email" | "magiclink" | "invite" | "recovery";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [auth, setAuth] = useState<{
    token: string;
    type: AuthType | null;
    redirect_to: string;
  }>({ token: "", type: null, redirect_to: "/home" });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Extract and validate auth parameters
  useEffect(() => {
    const checkSession = async () => {
      // Vérifier si l'utilisateur est déjà connecté
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/home', { replace: true });
          return;
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
      }
      
      // Continuer avec la vérification des paramètres
      const token = searchParams.get("token_hash");
      const typeParam = searchParams.get("type");
      const redirect_to = searchParams.get("redirect_to") || "/home";

      const validTypes: AuthType[] = ["signup", "email", "magiclink", "invite", "recovery"];
      const type = validTypes.includes(typeParam as AuthType)
          ? (typeParam as AuthType)
          : null;

      if (token && type) {
        setAuth({ token, type, redirect_to });
      } else {
        setIsLoading(false);
        setErrorMessage("Paramètres de vérification manquants ou invalides.");
      }
    };
    
    checkSession();
  }, [searchParams, navigate]);

  const handleRedirect = useCallback(async () => {
    if (!auth.token || !auth.type) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Verify OTP token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: auth.token,
        type: auth.type,
      });

      if (error) {
        console.error("Erreur de vérification:", error.message);
        setErrorMessage("Une erreur s'est produite lors de la vérification. Veuillez réessayer.");
        return;
      }

      // Use session from verification response
      const session = data.session;
      if (!session) {
        setErrorMessage("Session non disponible. Veuillez réessayer.");
        return;
      }

      // Handle navigation
      switch (auth.type) {
        case "signup":
        case "magiclink":
          navigate("/home");
          break;
        case "recovery":
          navigate("/reset-password");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setErrorMessage("Une erreur technique inattendue s'est produite.");
    } finally {
      setIsLoading(false);
    }
  }, [auth.token, auth.type, auth.redirect_to, navigate]);

  // Auto-trigger verification when valid auth exists
  useEffect(() => {
    if (auth.token && auth.type) {
      handleRedirect();
    }
  }, [auth.token, auth.type, handleRedirect]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md py-8">
          <div className="text-center mb-6">
            <img 
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
              alt="PedagoIA Logo" 
              className="h-24 w-auto mx-auto mb-4" 
            />
            <h1 className="text-2xl font-bold">Vérification en cours</h1>
            <p className="text-muted-foreground mt-2">Veuillez patienter pendant que nous vérifions votre email...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 pb-6">
          <div className="text-center mb-6">
            <img 
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
              alt="PedagoIA Logo" 
              className="h-24 w-auto mx-auto mb-4" 
            />
            <h1 className="text-2xl font-bold">Vérification de l'email</h1>
          </div>
          
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur de vérification</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            {!auth.token ? (
              <p className="text-center text-red-500">Lien de vérification invalide ou expiré.</p>
            ) : (
              <Button
                onClick={handleRedirect}
                className="w-full"
              >
                Réessayer la vérification
              </Button>
            )}
            
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Retour à la page de connexion
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
