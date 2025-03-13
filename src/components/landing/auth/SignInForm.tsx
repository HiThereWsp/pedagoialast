
import { Button } from "@/components/ui/button"
import { useAuthForm } from "@/hooks/use-auth-form"
import { AuthFormField } from "./AuthFormField"
import { useToast } from "@/hooks/use-toast"
import { posthog } from "@/integrations/posthog/client"
import { useNavigate } from "react-router-dom"
import { AuthError } from "@supabase/supabase-js"
import { Mail, Lock } from "lucide-react"

interface SignInFormProps {
  onToggleMode: () => void
}

export const SignInForm = ({ onToggleMode }: SignInFormProps) => {
  const { formState, setField, handleSignIn } = useAuthForm()
  const { toast } = useToast()
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formState.email || !formState.password) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        duration: 3000,
      })
      return
    }

    try {
      // Track login attempt
      posthog.capture('login_started')
      
      await handleSignIn(e)
      
      // Track successful login
      posthog.capture('login_completed')

      // Show welcome toast
      toast({
        title: "Connexion réussie",
        description: "Content de vous revoir !",
        duration: 3000,
      })

      // Redirect to home page
      navigate('/home', { replace: true })
      
    } catch (error) {
      console.error("Login error:", error)
      
      let errorMessage = "Une erreur est survenue lors de la connexion"
      
      if (error instanceof AuthError) {
        switch (error.message) {
          case "Invalid login credentials":
            errorMessage = "Email ou mot de passe incorrect"
            break
          case "Email not confirmed":
            errorMessage = "Veuillez confirmer votre email avant de vous connecter"
            break
          case "Rate limit exceeded":
            errorMessage = "Trop de tentatives. Veuillez réessayer plus tard"
            break
          default:
            errorMessage = "Erreur lors de la connexion. Veuillez réessayer"
        }
      }
      
      // Track login error
      posthog.capture('login_error', {
        error_type: error instanceof Error ? error.message : 'unknown'
      })
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: errorMessage,
      })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="relative">
          <AuthFormField
            id="email"
            label="Email"
            type="email"
            value={formState.email}
            onChange={(value) => setField("email", value)}
            placeholder="Votre email"
            required
            icon={<Mail className="h-4 w-4 text-gray-400" />}
          />
        </div>
        
        <div className="relative">
          <AuthFormField
            id="password"
            label="Mot de passe"
            type="password"
            value={formState.password}
            onChange={(value) => setField("password", value)}
            placeholder="Votre mot de passe"
            required
            icon={<Lock className="h-4 w-4 text-gray-400" />}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gray-900 hover:bg-gray-800 text-white"
        disabled={formState.isLoading}
      >
        {formState.isLoading ? "Connexion en cours..." : "Se connecter"}
      </Button>

      <div className="flex flex-col space-y-2 text-center text-sm">
        <Button 
          type="button" 
          variant="ghost" 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => navigate("/forgot-password")}
        >
          Mot de passe oublié ?
        </Button>
        
        <Button 
          type="button" 
          variant="ghost"
          className="text-gray-500 hover:text-gray-700" 
          onClick={onToggleMode}
        >
          Pas encore de compte ? <span className="font-semibold ml-1">S'inscrire</span>
        </Button>
      </div>
    </form>
  )
}
