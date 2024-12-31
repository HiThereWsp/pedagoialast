import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect } from "react"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const returnUrl = location.state?.returnUrl || '/chat'
        navigate(returnUrl, { replace: true })
      }
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const returnUrl = location.state?.returnUrl || '/chat'
        navigate(returnUrl, { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, location.state])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Assistant Pédagogique IA
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous pour continuer
          </p>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                },
              },
            },
            className: {
              button: 'bg-primary hover:bg-primary/90',
              input: 'bg-background',
              label: 'text-foreground',
            },
          }}
          providers={[]}
          redirectTo={window.location.origin + "/chat"}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: 'Se connecter',
                loading_button_label: 'Connexion en cours...',
                email_input_placeholder: 'Votre adresse email',
                password_input_placeholder: 'Votre mot de passe',
                link_text: 'Déjà inscrit ? Connectez-vous',
              },
              sign_up: {
                email_label: 'Adresse email',
                password_label: 'Mot de passe',
                button_label: "S'inscrire",
                loading_button_label: 'Inscription en cours...',
                email_input_placeholder: 'Votre adresse email',
                password_input_placeholder: 'Votre mot de passe',
                link_text: 'Pas encore de compte ? Inscrivez-vous',
                confirmation_text: 'Vérifiez vos emails pour confirmer votre inscription',
              },
              forgotten_password: {
                email_label: 'Adresse email',
                button_label: 'Réinitialiser le mot de passe',
                loading_button_label: 'Envoi en cours...',
                link_text: 'Mot de passe oublié ?',
                confirmation_text: 'Vérifiez vos emails pour réinitialiser votre mot de passe',
              },
            },
          }}
        />
      </div>
    </div>
  )
}