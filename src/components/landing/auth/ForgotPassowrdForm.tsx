
import { Button } from "@/components/ui/button"
import { useForgotPasswordForm } from "@/hooks/useForgotPasswordForm"
import { AuthFormField } from "./AuthFormField"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, Info } from "lucide-react"

export const ForgotPasswordForm = () => {
  const { formState, setField, HandlePasswordReset, navigate } = useForgotPasswordForm()
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await HandlePasswordReset(e)
    } catch (error: any) {
      console.error("Erreur détaillée lors de la demande de réinitialisation:", error)

      // Afficher un message d'erreur plus détaillé
      toast({
        variant: "destructive",
        title: "Erreur lors de la demande",
        description: error?.message || "Une erreur est survenue lors de la demande de réinitialisation. Veuillez réessayer.",
        duration: 5000,
      })
    }
  }

  return (
    <div className="space-y-4">
      {!formState.isSuccess ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <AuthFormField
            id="email"
            label="Email"
            type="email"
            value={formState.email}
            onChange={(value) => setField("email", value)}
            placeholder="Votre email"
            required
          />

          <Button type="submit" className="w-full" disabled={formState.isLoading}>
            {formState.isLoading ? "Envoi en cours..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>
      ) : (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-700">Email envoyé</AlertTitle>
          <AlertDescription className="text-blue-700">
            Un email a été envoyé à <strong>{formState.email}</strong> avec des instructions pour réinitialiser votre mot de passe.
            <p className="mt-2">Veuillez vérifier votre boîte de réception (et éventuellement vos spams) et suivre le lien pour réinitialiser votre mot de passe.</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
