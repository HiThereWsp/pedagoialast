import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { TermsDialog } from "../terms/TermsDialog"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

export const LoginForm = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!acceptedTerms && isSignUp) {
      toast({
        variant: "destructive",
        title: "Conditions d'utilisation",
        description: "Veuillez accepter les conditions d'utilisation pour continuer.",
      })
      return
    }

    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName
            }
          }
        })
        
        if (error) throw error

        toast({
          title: "Inscription réussie",
          description: "Vérifiez vos emails pour confirmer votre inscription.",
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (error) throw error

        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        })
      }
    } catch (error: any) {
      if (error.message.includes("User already registered")) {
        toast({
          variant: "destructive",
          title: "Compte existant",
          description: "Un compte existe déjà avec cette adresse email. Veuillez vous connecter.",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isSignUp ? "Inscription" : "Connexion"}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Votre prénom"
              required
            />
          </div>
        )}
        
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

        {isSignUp && (
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
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
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading 
            ? (isSignUp ? "Inscription en cours..." : "Connexion en cours...") 
            : (isSignUp ? "S'inscrire" : "Se connecter")}
        </Button>

        <Button 
          type="button" 
          variant="ghost" 
          className="w-full"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp 
            ? "Déjà inscrit ? Se connecter" 
            : "Pas encore de compte ? S'inscrire"}
        </Button>
      </form>
    </>
  )
}