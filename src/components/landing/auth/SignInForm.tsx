import { Button } from "@/components/ui/button"
import { useAuthForm } from "@/hooks/use-auth-form"
import { AuthFormField } from "./AuthFormField"
import {useNavigate} from "react-router-dom";

interface SignInFormProps {
  onToggleMode: () => void
}

export const SignInForm = ({ onToggleMode }: SignInFormProps) => {
  const { formState, setField, handleSignIn } = useAuthForm()
    const navigate = useNavigate()
  return (
    <form onSubmit={handleSignIn} className="space-y-4">
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
        <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/forgot-password")}
        >
            Mot de passe oublié ? Réinitialisez ici
        </Button>
    </form>
  )
}