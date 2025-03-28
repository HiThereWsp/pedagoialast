
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Provider = "facebook" | "google";

interface SocialLoginButtonsProps {
  isSignUp: boolean;
}

export function SocialLoginButtons({ isSignUp }: SocialLoginButtonsProps) {
  const { toast } = useToast();

  const handleSocialLogin = async (provider: Provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: "https://pedagoia.fr//login"
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: `Erreur lors de la tentative de connexion avec ${provider}: ${error.message}`,
        });
        console.error("Erreur d'authentification sociale:", error);
      }
    } catch (error) {
      console.error("Erreur inattendue lors de l'authentification sociale:", error);
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Une erreur est survenue lors de la connexion. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="w-full space-y-4 my-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">
            {isSignUp ? "Ou inscrivez-vous avec" : "Ou connectez-vous avec"}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        <FacebookLoginButton onClick={() => handleSocialLogin("facebook")}>
          {isSignUp ? <span>S'inscrire avec Facebook</span> : <span>Se connecter avec Facebook</span>}
        </FacebookLoginButton>
        
        <GoogleLoginButton onClick={() => handleSocialLogin("google")}>
          {isSignUp ? <span>S'inscrire avec Google</span> : <span>Se connecter avec Google</span>}
        </GoogleLoginButton>
      </div>
    </div>
  );
}
