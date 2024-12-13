import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

const Login = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/')
      }
    }
    checkAuth()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Assistant Pédagogique IA
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous pour accéder à votre assistant
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: "Email",
                password_label: "Mot de passe",
                button_label: "Se connecter",
                loading_button_label: "Connexion en cours...",
                social_provider_text: "Continuer avec {{provider}}",
                link_text: "Vous avez déjà un compte ? Connectez-vous",
              },
              sign_up: {
                email_label: "Email",
                password_label: "Mot de passe",
                button_label: "S'inscrire",
                loading_button_label: "Inscription en cours...",
                social_provider_text: "Continuer avec {{provider}}",
                link_text: "Vous n'avez pas de compte ? Inscrivez-vous",
              },
            },
          }}
        />
      </div>
    </div>
  )
}

export default Login