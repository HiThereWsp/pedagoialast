
import { useState } from "react";
import { SignUpForm } from "./auth/SignUpForm";
import { SignInForm } from "./auth/SignInForm";
import { supabase } from "@/integrations/supabase/client.ts";
import { useNavigate } from "react-router-dom";
import { Provider } from "@supabase/supabase-js";
import { AnimatedText } from "@/components/ui/animated-text";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  
  // Les deux phrases à alterner
  const welcomePhrases = [
    "Bienvenue dans l'éducation de demain...",
    "Ensemble simplifions votre quotidien."
  ];
  
  return <div className="flex flex-col md:flex-row min-h-[500px] overflow-hidden rounded-xl shadow-lg">
      {/* Formulaire de gauche */}
      <div className="flex-1 bg-white p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {isSignUp ? "Inscription" : "Connexion"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isSignUp ? "Créez votre compte pour commencer" : "Accédez à votre compte"}
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Supabase Auth UI */}
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#404040',
                    brandAccent: '#222222',
                  },
                },
              },
            }}
            providers={["google", "facebook"]}
            redirectTo={window.location.origin + "/home"}
            onlyThirdPartyProviders={false}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Email",
                  password_label: "Mot de passe",
                  button_label: "Se connecter",
                  loading_button_label: "Connexion en cours...",
                  link_text: "Déjà un compte ? Se connecter",
                  social_provider_text: "Se connecter avec {{provider}}",
                },
                sign_up: {
                  email_label: "Email",
                  password_label: "Mot de passe",
                  button_label: "S'inscrire",
                  loading_button_label: "Inscription en cours...",
                  link_text: "Pas de compte ? S'inscrire",
                  social_provider_text: "S'inscrire avec {{provider}}",
                },
              }
            }}
          />
          
          {/* Option de basculement entre connexion et inscription maintenue comme interface utilisateur alternative */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? (
              <button 
                onClick={() => setIsSignUp(false)} 
                className="text-blue-600 hover:underline"
              >
                Déjà inscrit ? Se connecter
              </button>
            ) : (
              <button 
                onClick={() => setIsSignUp(true)} 
                className="text-blue-600 hover:underline"
              >
                Pas encore de compte ? S'inscrire
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Partie de droite avec animation */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-400 items-center justify-center p-10 text-white">
        <div className="max-w-md">
          <AnimatedText 
            phrases={welcomePhrases} 
            className="text-4xl md:text-5xl font-bold mb-6 text-white" 
            typingSpeed={100} 
            deletingSpeed={50} 
            delayBetweenPhrases={3000} 
          />
        </div>
      </div>
    </div>;
};
