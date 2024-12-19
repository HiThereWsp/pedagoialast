import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const Login = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session) {
          navigate('/chat')
        } else if (event === 'SIGNED_OUT') {
          navigate('/login')
        } else if (event === 'PASSWORD_RECOVERY') {
          toast({
            title: "Réinitialisation du mot de passe",
            description: "Suivez les instructions envoyées par email pour réinitialiser votre mot de passe.",
          })
        } else if (event === 'USER_UPDATED') {
          toast({
            title: "Compte mis à jour",
            description: "Vos informations ont été mises à jour avec succès.",
          })
        } else if (event === 'USER_EXISTS') {
          toast({
            variant: "destructive",
            title: "Erreur d'inscription",
            description: "Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.",
          })
        }
      } catch (error) {
        console.error('Error in auth state change:', error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue. Veuillez réessayer.",
        })
      }
    })
    
    return () => subscription.unsubscribe()
  }, [navigate, toast])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Assistant Pédagogique IA</h2>
          <p className="mt-2 text-sm text-gray-600">Connectez-vous pour continuer</p>
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
            },
          }}
          view="sign_up"
          onError={(error) => {
            toast({
              variant: "destructive",
              title: "Erreur",
              description: error.message === "User already registered" 
                ? "Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse."
                : "Une erreur est survenue. Veuillez réessayer.",
            })
          }}
          additionalData={{
            first_name: {
              label: 'Prénom',
              placeholder: 'Votre prénom',
              type: 'text',
              required: true,
            },
          }}
        />
      </div>
    </div>
  )
}

export default Login
