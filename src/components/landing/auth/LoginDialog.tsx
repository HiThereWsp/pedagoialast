
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthForm } from "@/hooks/use-auth-form";
import { posthog } from "@/integrations/posthog/client";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AuthError } from "@supabase/supabase-js";
import { SocialLoginButtons } from "./SocialLoginButtons";

export function LoginDialog() {
  const { formState, setField, handleSignIn } = useAuthForm();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.email || !formState.password) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        duration: 3000,
      });
      return;
    }

    try {
      // Track login attempt
      posthog.capture('login_dialog_started');
      
      await handleSignIn(e);
      
      // Track successful login
      posthog.capture('login_dialog_completed');

      // Show welcome toast
      toast({
        title: "Connexion réussie",
        description: "Content de vous revoir !",
        duration: 3000,
      });

      // Redirect to tableaudebord page
      navigate('/tableaudebord', { replace: true });
      
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Une erreur est survenue lors de la connexion";
      
      if (error instanceof AuthError) {
        switch (error.message) {
          case "Invalid login credentials":
            errorMessage = "Email ou mot de passe incorrect";
            break;
          case "Email not confirmed":
            errorMessage = "Veuillez confirmer votre email avant de vous connecter";
            break;
          case "Rate limit exceeded":
            errorMessage = "Trop de tentatives. Veuillez réessayer plus tard";
            break;
          default:
            errorMessage = "Erreur lors de la connexion. Veuillez réessayer";
        }
      }
      
      // Track login error
      posthog.capture('login_dialog_error', {
        error_type: error instanceof Error ? error.message : 'unknown'
      });
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: errorMessage,
      });
    }
  };

  return (
    <>
      <DialogHeader className="mb-4">
        <div className="mx-auto mb-4">
          <img 
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
            alt="PedagoIA Logo" 
            className="h-16 w-auto" 
          />
        </div>
        <DialogTitle className="text-xl font-extrabold tracking-tight text-balance text-center">
          Connexion rapide
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="email-dialog" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="email-dialog"
                type="email"
                value={formState.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="Votre email"
                required
                className="pl-10 h-11 text-base border-gray-300 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password-dialog" className="text-sm font-medium text-gray-700">
              Mot de passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="password-dialog"
                type={showPassword ? "text" : "password"}
                value={formState.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="Votre mot de passe"
                required
                className="pl-10 h-11 text-base border-gray-300 focus:border-gray-400 focus:ring-gray-400"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
                <span className="sr-only">
                  {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gray-900 hover:bg-gray-800 text-white h-11"
          disabled={formState.isLoading}
        >
          {formState.isLoading ? "Connexion en cours..." : "Se connecter"}
        </Button>

        {/* Ajout des boutons de connexion sociale */}
        <SocialLoginButtons isSignUp={false} />

        <DialogFooter className="flex-col gap-2 text-center sm:gap-0">
          <Button 
            type="button" 
            variant="ghost" 
            className="text-gray-500 hover:text-gray-700 text-sm"
            onClick={() => navigate("/forgot-password")}
          >
            Mot de passe oublié ?
          </Button>
          
          <div className="mt-2 text-center text-sm text-gray-500">
            Pas encore de compte ?{" "}
            <Button 
              type="button" 
              variant="link"
              className="p-0 h-auto text-sm text-primary hover:text-primary/90" 
              onClick={() => navigate("/login")}
            >
              S'inscrire
            </Button>
          </div>
        </DialogFooter>
      </form>
    </>
  );
}
