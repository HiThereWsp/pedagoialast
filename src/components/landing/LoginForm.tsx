import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"

export const LoginForm = () => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Connexion / Inscription</DialogTitle>
      </DialogHeader>
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "hsl(var(--primary))",
                brandAccent: "hsl(var(--primary))",
              },
            },
          },
        }}
        providers={[]}
        localization={{
          variables: {
            sign_in: {
              email_label: "Adresse email",
              password_label: "Mot de passe",
              button_label: "Se connecter",
              loading_button_label: "Connexion en cours...",
              email_input_placeholder: "Votre adresse email",
              password_input_placeholder: "Votre mot de passe",
              link_text: "Déjà inscrit ? Connectez-vous",
            },
            sign_up: {
              email_label: "Adresse email",
              password_label: "Mot de passe",
              button_label: "S'inscrire",
              loading_button_label: "Inscription en cours...",
              email_input_placeholder: "Votre adresse email",
              password_input_placeholder: "Votre mot de passe",
              link_text: "Pas encore de compte ? Inscrivez-vous",
            },
          },
        }}
      />
    </>
  )
}