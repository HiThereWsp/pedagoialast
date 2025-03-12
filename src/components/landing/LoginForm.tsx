
import { useState } from "react";
import { SignUpForm } from "./auth/SignUpForm";
import { SignInForm } from "./auth/SignInForm";
import { supabase } from "@/integrations/supabase/client.ts";
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import { useNavigate } from "react-router-dom";
import { Provider } from "@supabase/supabase-js";
import { AnimatedText } from "@/components/ui/animated-text";
import { Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const SocialLogin = async (provider_name: Provider) => {
    const {
      data,
      error
    } = await supabase.auth.signInWithOAuth({
      provider: provider_name,
      options: {
        redirectTo: "https://pedagoia.fr/login"
      }
    });
  };
  
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
          <div className="grid grid-cols-1 gap-3">
            <Button onClick={() => SocialLogin("facebook" as Provider)} className="w-full bg-[#4267B2] hover:bg-[#365899] text-white">
              <Facebook className="h-4 w-4 mr-2" />
              {isSignUp ? "S'inscrire avec Facebook" : "Se connecter avec Facebook"}
            </Button>
            
            <Button onClick={() => SocialLogin("google" as Provider)} variant="outline" className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              {isSignUp ? "S'inscrire avec Google" : "Se connecter avec Google"}
            </Button>
          </div>
          
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-sm text-gray-400">ou</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          
          {isSignUp ? <SignUpForm onToggleMode={() => setIsSignUp(false)} /> : <SignInForm onToggleMode={() => setIsSignUp(true)} />}
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
