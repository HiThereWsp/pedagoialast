import { Button } from "@/components/ui/button"
import { useAuthForm } from "@/hooks/use-auth-form"
import { AuthFormField } from "./AuthFormField"
import { useToast } from "@/hooks/use-toast"
import { posthog } from "@/integrations/posthog/client"

interface SignInFormProps {
  onToggleMode: () => void
}

export const SignInForm = ({ onToggleMode }: SignInFormProps) => {
  const { formState, setField, handleSignIn } = useAuthForm()
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Track login attempt
      posthog.capture('login_started')
      
      await handleSignIn(e)
      
      // Track successful login
      posthog.capture('login_completed')
    } catch (error: any) {
      console.error("Login error:", error)
      
      // Track login error
      posthog.capture('login_error', {
        error_type: error?.message || 'unknown'
      })
      
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: error?.message || "Une erreur est survenue lors de la connexion. Veuillez réessayer.",
      })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthFormField
        id="email"
        label="Email"
        type="email"
        value={formState.email}
        onChange={(value) => setField("email", value)}
        placeholder="Votre email"
      />
      
      <AuthFormField
        id="password"
        label="Mot de passe"
        type="password"
        value={formState.password}
        onChange={(value) => setField("password", value)}
        placeholder="Votre mot de passe"
      />

      <Button type="submit" className="w-full" disabled={formState.isLoading}>
        {formState.isLoading ? "Connexion en cours..." : "Se connecter"}
      </Button>

      <Button 
        type="button" 
        variant="ghost" 
        className="w-full"
        onClick={onToggleMode}
      >
        Pas encore de compte ? S'inscrire
      </Button>
    </form>
  )
}
