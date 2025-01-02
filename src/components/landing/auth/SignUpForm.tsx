import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TermsDialog } from "@/components/terms/TermsDialog"
import { useAuthForm } from "@/hooks/use-auth-form"
import { AuthFormField } from "./AuthFormField"

interface SignUpFormProps {
  onToggleMode: () => void
}

export const SignUpForm = ({ onToggleMode }: SignUpFormProps) => {
  const { formState, setField, handleSignUp } = useAuthForm()

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
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
  )
}