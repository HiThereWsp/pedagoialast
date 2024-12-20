import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { TermsDialog } from "../terms/TermsDialog"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface LoginFormProps {
  defaultView?: "sign_in" | "sign_up"
}

export const LoginForm = ({ defaultView = "sign_up" }: LoginFormProps) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const { toast } = useToast()
  
  const redirectTo = window.location.hostname === 'localhost' || window.location.hostname.includes('lovableproject.com')
    ? `${window.location.origin}/chat`
    : 'https://pedagoia.fr/chat'

  useEffect(() => {
    console.log("Current URL:", window.location.href)
    console.log("Redirect URL:", redirectTo)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event)
      console.log("Session:", session)
      
      if (event === 'SIGNED_IN') {
        console.log("Utilisateur connecté, redirection vers /chat")
        window.location.href = redirectTo
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [redirectTo])

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {defaultView === "sign_up" ? "Inscription" : "Connexion"}
        </h2>
      </div>

      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: "hsl(var(--primary))",
                brandAccent: "hsl(var(--primary))",
              },
            },
          },
          className: {
            container: "space-y-4",
            label: "text-foreground",
            button: "w-full",
            divider: "my-4",
            message: "text-sm text-red-500 mt-2",
            input: "bg-background",
          },
        }}
        providers={[]}
        redirectTo={redirectTo}
        localization={{
          variables: {
            sign_in: {
              email_label: "Adresse email",
              password_label: "Mot de passe",
              button_label: "Se connecter",
              loading_button_label: "Connexion en cours...",
              email_input_placeholder: "Votre adresse email",
              password_input_placeholder: "Votre mot de passe",
              link_text: "Vous n'avez pas de compte ? Inscrivez-vous",
            },
            sign_up: {
              email_label: "Adresse email",
              password_label: "Mot de passe",
              button_label: "S'inscrire",
              loading_button_label: "Inscription en cours...",
              email_input_placeholder: "Votre adresse email",
              password_input_placeholder: "Votre mot de passe",
              link_text: "Déjà inscrit ? Connectez-vous",
              confirmation_text: "Vérifiez vos emails pour confirmer votre inscription",
            },
          },
        }}
        view={defaultView}
        additionalData={{
          first_name: {
            type: "text",
            label: "Prénom",
            placeholder: "Votre prénom",
            required: true,
            order: 1,
          },
        }}
      />
      {defaultView === "sign_up" && (
        <div className="mt-4 space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={(checked) => {
                setAcceptedTerms(checked as boolean)
                if (!checked) {
                  toast({
                    variant: "destructive",
                    title: "Conditions d'utilisation",
                    description: "Veuillez accepter les conditions d'utilisation pour continuer.",
                  })
                }
              }}
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
        </div>
      )}
    </div>
  )
}