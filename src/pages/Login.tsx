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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
      } else if (event === 'SIGNED_UP') {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, toast])

  const handleError = (error: Error) => {
    let title = "Erreur d'authentification"
    let description = "Une erreur est survenue. Voici quelques suggestions :"

    if (error.message.includes('Email not confirmed')) {
      title = "Email non confirmé"
      description = "Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation. Si vous ne trouvez pas l'email, vérifiez vos spams ou demandez un nouvel email de confirmation."
    } else if (error.message.includes('Invalid login credentials')) {
      title = "Identifiants incorrects"
      description = "• Vérifiez que votre email est correctement saisi\n• Assurez-vous que votre mot de passe est correct\n• Si vous avez oublié votre mot de passe, utilisez l'option 'Mot de passe oublié'"
    } else if (error.message.includes('Email already registered')) {
      title = "Email déjà utilisé"
      description = "Un compte existe déjà avec cet email. Essayez de vous connecter ou utilisez l'option 'Mot de passe oublié' si nécessaire."
    } else if (error.message.includes('Password should be at least 6 characters')) {
      title = "Mot de passe trop court"
      description = "Votre mot de passe doit contenir au moins 6 caractères pour des raisons de sécurité."
    }

    toast({
      title,
      description,
      variant: "destructive",
    })
  }

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
          onError={handleError}
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
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export default Login