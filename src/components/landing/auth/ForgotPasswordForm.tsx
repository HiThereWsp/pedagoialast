import { Button } from "@/components/ui/button"
import { useForgotPasswordForm } from "@/hooks/useForgotPasswordForm"
import { AuthFormField } from "./AuthFormField"
import { useToast } from "@/hooks/use-toast"

export const ForgotPasswordForm = () => {
  const { formState, setField, HandlePasswordReset } = useForgotPasswordForm()
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await HandlePasswordReset(e)
    } catch (error: any) {
      console.error("Password reset error details:", error)
      toast({
        variant: "destructive",
        title: "Erreur lors de la réinitialisation",
        description: error?.message || "Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez réessayer.",
      })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!formState.isSuccess ? (
        <>
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
        </>
      ) : (
        <p>
          Un email vous a été envoyé avec des instructions pour réinitialiser votre mot de passe à
          l'adresse {formState.email}
        </p>
      )}
    </form>
  )
}