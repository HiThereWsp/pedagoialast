import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"

interface SignInFormProps {
  onToggleMode: () => void;
}

export const SignInForm = ({ onToggleMode }: SignInFormProps) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast({
            variant: "destructive",
            title: "Email non confirmé",
            description: "Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte de réception.",
          })
        } else if (error.message.includes("Too many requests")) {
          toast({
            variant: "destructive",
            title: "Trop de tentatives",
            description: "Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Identifiants incorrects. Veuillez vérifier votre email et mot de passe."
          })
        }
        return
      }

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue est survenue. Veuillez réessayer."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Votre mot de passe"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Connexion en cours..." : "Se connecter"}
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