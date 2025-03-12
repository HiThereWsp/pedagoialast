
import { useState } from "react";
import { SignInForm } from "./auth/SignInForm";
import { SignUpForm } from "./auth/SignUpForm";
import { AnimatedText } from "@/components/ui/animated-text";
import { Link } from "react-router-dom";

export const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Les deux phrases à alterner
  const welcomePhrases = [
    "Bienvenue dans l'éducation de demain...",
    "Ensemble simplifions votre quotidien."
  ];
  
  return (
    <div className="flex flex-col md:flex-row min-h-[500px] overflow-hidden rounded-xl shadow-lg">
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
          {isSignUp ? (
            <SignUpForm onToggleMode={() => setIsSignUp(false)} />
          ) : (
            <SignInForm onToggleMode={() => setIsSignUp(true)} />
          )}
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
    </div>
  );
};
