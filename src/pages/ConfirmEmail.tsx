
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client.ts";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";

type AuthType = "signup" | "email" | "magiclink" | "invite" | "recovery";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [auth, setAuth] = useState<{
    token: string;
    type: AuthType | null;
    redirect_to: string;
  }>({ token: "", type: null, redirect_to: "/home" });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationComplete, setVerificationComplete] = useState(false);

  // Extract and validate auth parameters
  useEffect(() => {
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
      setErrorMessage("Lien de vérification invalide ou expiré.");
    }
  }, [searchParams]);

  const handleRedirect = useCallback(async () => {
    if (!auth.token || !auth.type) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("Vérification du token:", {
        token_hash: auth.token,
        type: auth.type
      });

      // Verify OTP token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: auth.token,
        type: auth.type,
      });

      if (error) {
        console.error("Erreur de vérification:", error.message);
        setErrorMessage("Une erreur est survenue lors de la vérification. Veuillez réessayer ou contacter le support.");
        return;
      }

      // Use session from verification response
      const session = data.session;
      if (!session) {
        setErrorMessage("Session non disponible. Veuillez vous reconnecter.");
        return;
      }

      setVerificationComplete(true);
      toast({
        title: "Vérification réussie",
        description: "Votre email a été confirmé avec succès.",
      });

      // Handle navigation
      setTimeout(() => {
        switch (auth.type) {
          case "signup":
          case "magiclink":
            navigate("/home");
            break;
          case "recovery":
            navigate("/reset-password");
            break;
          default:
            navigate("/home");
        }
      }, 1500); // Petit délai pour laisser le toast s'afficher
    } catch (err) {
      console.error("Erreur inattendue:", err);
      setErrorMessage("Une erreur inattendue s'est produite.");
    } finally {
      setIsLoading(false);
    }
  }, [auth.token, auth.type, auth.redirect_to, navigate, toast]);

  // Auto-trigger verification when valid auth exists
  useEffect(() => {
    if (auth.token && auth.type && !verificationComplete) {
      handleRedirect();
    }
  }, [auth.token, auth.type, handleRedirect, verificationComplete]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <SEO
          title="Confirmation d'email | PedagoIA"
          description="Confirmation de votre adresse email pour accéder à PedagoIA"
        />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de votre adresse email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <SEO
        title="Confirmation d'email | PedagoIA"
        description="Confirmation de votre adresse email pour accéder à PedagoIA"
      />
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          {verificationComplete ? (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-green-600">Email confirmé avec succès!</h1>
              <p>Vous allez être redirigé vers la page d'accueil...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : errorMessage ? (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-red-600">Erreur de vérification</h1>
              <p className="text-red-500">{errorMessage}</p>
              {auth.token && (
                <Button
                  onClick={handleRedirect}
                  className="mt-4"
                >
                  Réessayer la vérification
                </Button>
              )}
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                >
                  Retour à la connexion
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Lien de vérification invalide</h1>
              <p>Le lien de vérification est invalide ou a expiré.</p>
              <Button
                onClick={() => navigate("/login")}
                className="mt-4"
              >
                Retour à la connexion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
