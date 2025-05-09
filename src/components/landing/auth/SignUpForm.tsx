
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TermsDialog } from "@/components/terms/TermsDialog"
import { useAuthForm } from "@/hooks/use-auth-form"
import { AuthFormField } from "./AuthFormField"
import { useToast } from "@/hooks/use-toast"
import { posthog } from "@/integrations/posthog/client"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ExistingUserDialog } from "./ExistingUserDialog"

interface SignUpFormProps {
  onToggleMode: () => void
}

export const SignUpForm = ({ onToggleMode }: SignUpFormProps) => {
  const { 
    formState, 
    setField, 
    handleSignUp, 
    signUpSuccess, 
    existingUserDetected,
    setExistingUserDetected 
  } = useAuthForm()
  const { toast } = useToast()
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formState.acceptedTerms) {
      toast({
        variant: "destructive",
        title: "Conditions d'utilisation",
        description: "Veuillez accepter les conditions d'utilisation pour continuer.",
      })
      return
    }

    try {
      // Track signup attempt
      posthog.capture('signup_started', {
        has_first_name: !!formState.firstName
      })

      await handleSignUp(e)
      
      if (!existingUserDetected) {
        // Track successful signup
        posthog.capture('signup_completed', {
          has_first_name: !!formState.firstName
        })
      }
    } catch (error: any) {
      console.error("Signup error details:", error)
      
      // Track signup error
      posthog.capture('signup_error', {
        error_type: error?.message || 'unknown'
      })
      
      toast({
        variant: "destructive",
        title: "Erreur lors de l'inscription",
        description: error?.message || "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
      })
    }
  }

  // Gestion de l'état de succès de l'inscription
  useEffect(() => {
    if (signUpSuccess) {
      // Vous pouvez ajouter des actions supplémentaires ici si nécessaire
      console.log("Inscription réussie !")
    }
  }, [signUpSuccess])

  return signUpSuccess ? (
    <p className="text-center p-4 bg-green-50 border border-green-100 rounded-md text-green-800">
      Merci pour votre inscription ! Veuillez vérifier votre email ({formState.email}) pour le lien de confirmation.
    </p>
  ) : (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthFormField
          id="firstName"
          label="Prénom"
          value={formState.firstName || ""}
          onChange={(value) => setField("firstName", value)}
          placeholder="Votre prénom"
        />
        
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

        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            checked={formState.acceptedTerms}
            onCheckedChange={(checked) => setField("acceptedTerms", checked)}
            className="mt-1"
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm text-muted-foreground leading-relaxed"
            >
              J'accepte les <TermsDialog /> et la politique de confidentialité de Pedagoia
            </Label>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={formState.isLoading}>
          {formState.isLoading ? "Inscription en cours..." : "S'inscrire"}
        </Button>

        <Button 
          type="button" 
          variant="ghost" 
          className="w-full"
          onClick={onToggleMode}
        >
          Déjà inscrit ? Se connecter
        </Button>
      </form>
      
      {/* Dialogue pour les utilisateurs existants */}
      <ExistingUserDialog 
        isOpen={existingUserDetected}
        onClose={() => setExistingUserDetected(false)}
        onSwitchToSignIn={onToggleMode}
        email={formState.email}
      />
    </>
  )
}
