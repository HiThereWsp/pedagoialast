import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/lib/supabase"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function Login() {
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/chat')
      } else if (event === 'SIGNED_OUT') {
        navigate('/login')
      } else if (event === 'USER_UPDATED') {
        toast({
          title: "Votre compte a été mis à jour",
          description: "Vos informations ont été modifiées avec succès.",
        })
      } else if (event === "PASSWORD_RECOVERY") {
        toast({
          title: "Réinitialisation du mot de passe",
          description: "Un email contenant les instructions vous a été envoyé.",
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, toast])

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
          redirectTo={`${window.location.origin}/chat`}
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
          view="sign_up"
          additionalData={{
            first_name: {
              label: 'Prénom',
              placeholder: 'Votre prénom',
              type: 'text',
              required: true,
            },
          }}
          onError={(error) => {
            toast({
              variant: "destructive",
              title: "Erreur",
              description: error.message === "User already registered" 
                ? "Cette adresse email est déjà utilisée. Veuillez vous connecter."
                : "Une erreur est survenue. Veuillez réessayer.",
            })
          }}
        />
      </div>
    </div>
  )
}
