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
          className: {
            container: "space-y-4",
            label: "text-foreground",
            button: "w-full",
            divider: "my-4",
            message: "text-sm text-red-500 mt-2",
            input: "bg-background",
          },
        }}
        providers={[]}
        redirectTo={`${window.location.origin}/chat`}
        localization={{
          variables: {
            sign_in: {
              email_label: "Adresse email",
              password_label: "Mot de passe",
              button_label: "Se connecter",
              loading_button_label: "Connexion en cours...",
              email_input_placeholder: "Votre adresse email",
              password_input_placeholder: "Votre mot de passe",
              link_text: "",
            },
            sign_up: {
              email_label: "Adresse email",
              password_label: "Mot de passe",
              button_label: "S'inscrire",
              loading_button_label: "Inscription en cours...",
              email_input_placeholder: "Votre adresse email",
              password_input_placeholder: "Votre mot de passe",
              link_text: "",
              confirmation_text: "Vérifiez vos emails pour confirmer votre inscription",
            },
          },
        }}
        view="sign_up"
        additionalData={{
          first_name: {
            type: "text",
            label: "Prénom",
            placeholder: "Votre prénom",
            required: true,
            order: 1,
          },
        }}
      />
      <div className="mt-4 text-sm text-muted-foreground">
        <p className="text-center">
          En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
        </p>
      </div>
    </>
  )
}