import { Button } from "@/components/ui/button"
import { useForgotPasswordForm } from "@/hooks/useForgotPasswordForm"
import { AuthFormField } from "./AuthFormField"
import { useToast } from "@/hooks/use-toast"

interface SignUpFormProps {
  onToggleMode: () => void
}

export const ForgotPasswordForm = () => {
  const { formState, setField, HandlePasswordReset, navigate } = useForgotPasswordForm()
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await HandlePasswordReset(e)
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
              id="email"
              label="Email"
              type="email"
              value={formState.email}
              onChange={(value) => setField("email", value)}
              placeholder="Votre email"
          />

            <Button type="submit" className="w-full" disabled={formState.isLoading}>
                {formState.isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
            </Button>

        </>: <>
          <p>Un email vous a été envoyé avec des instructions pour réinitialiser votre mot de passe à
            l'adresse {formState.email}</p>

        </>}


    </form>
  )
}