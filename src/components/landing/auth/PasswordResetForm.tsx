
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { usePasswordResetForm } from "@/hooks/usePasswordResetForm"
import { AuthFormField } from "./AuthFormField"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, ShieldCheck } from "lucide-react"

interface PasswordResetFormProps {
  onSuccess?: () => void
}

export const PasswordResetForm = ({ onSuccess }: PasswordResetFormProps) => {
  const { formState, setField, HandlePasswordReset } = usePasswordResetForm({ onSuccess })
  const { toast } = useToast()
  const [passwordError, setPasswordError] = useState("")

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    // Vérifier que les mots de passe correspondent
    if (formState.password !== formState.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.")
      return
    }

    // Vérifier la complexité du mot de passe
    if (formState.password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }

    try {
      await HandlePasswordReset(e)
    } catch (error: any) {
      console.error("Erreur détaillée lors de la réinitialisation:", error)
      
      toast({
        variant: "destructive",
        title: "Erreur de réinitialisation",
        description: error?.message || "Une erreur est survenue lors de la réinitialisation. Veuillez réessayer.",
        duration: 5000,
      })
    }
  }

  return (
    <div className="space-y-4">
      {formState.isSuccess ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-700">Réinitialisation réussie</AlertTitle>
          <AlertDescription className="text-green-700">
            Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert className="bg-blue-50 border-blue-200 mb-4">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Créez un nouveau mot de passe</AlertTitle>
            <AlertDescription className="text-blue-700">
              Veuillez choisir un nouveau mot de passe sécurisé d'au moins 6 caractères.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <AuthFormField
              id="password"
              label="Nouveau mot de passe"
              type="password"
              value={formState.password}
              onChange={(value) => setField("password", value)}
              placeholder="Votre nouveau mot de passe"
              required
            />
            <AuthFormField
              id="confirm-password"
              label="Confirmer le mot de passe"
              type="password"
              value={formState.confirmPassword}
              onChange={(value) => setField("confirmPassword", value)}
              placeholder="Confirmez votre mot de passe"
              required
            />
            
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
            
            <Button type="submit" className="w-full" disabled={formState.isLoading}>
              {formState.isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
