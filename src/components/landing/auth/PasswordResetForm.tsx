import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TermsDialog } from "@/components/terms/TermsDialog"
import { usePasswordResetForm } from "@/hooks/usePasswordResetForm"
import { AuthFormField } from "./AuthFormField"
import { useToast } from "@/hooks/use-toast"

interface SignUpFormProps {
  onToggleMode: () => void
}

export const PasswordResetForm = () => {
  const { formState, setField, HandlePasswordReset, navigate } = usePasswordResetForm()
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await HandlePasswordReset(e)
      if(formState.isSuccess) {
        navigate('/home')
      }
    } catch (error: any) {
      console.error("Signup error details:", error)

      // Afficher un message d'erreur plus détaillé
      toast({
        variant: "destructive",
        title: "Erreur lors de l'inscription",
        description: error?.message || "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
      })
    }
  }

  return (
      <form onSubmit={onSubmit} className="space-y-4">
        {!formState.isSuccess ? <>
          <AuthFormField
              id="password"
              label="Mot de passe"
              type="password"
              value={formState.password}
              onChange={(value) => setField("password", value)}
              placeholder="Votre mot de passe"
          />
          <AuthFormField
              id="confirm-password"
              label="Confirmer le Mot de passe"
              type="password"
              value={formState.confirmPassword}
              onChange={(value) => setField("confirmPassword", value)}
              placeholder="Votre mot de passe"
          />
          <Button type="submit" className="w-full" disabled={formState.isLoading}>
            {formState.isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
          </Button>
        </> : null}
      </form>
  )
}
