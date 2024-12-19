import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TermsDialog } from "@/components/terms/TermsDialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const Login = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleSignUp = (e: React.FormEvent) => {
    if (!acceptedTerms) {
      e.preventDefault()
      toast({
        variant: "destructive",
        title: "Conditions d'utilisation",
        description: "Veuillez accepter les conditions d'utilisation pour continuer.",
      })
      return false
    }
    return true
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session) {
          navigate('/chat')
        } else if (event === 'SIGNED_OUT') {
          navigate('/login')
        } else if (event === 'PASSWORD_RECOVERY') {
          toast({
            title: "Réinitialisation du mot de passe",
            description: "Suivez les instructions envoyées par email pour réinitialiser votre mot de passe.",
          })
        } else if (event === 'USER_UPDATED') {
          toast({
            title: "Compte mis à jour",
            description: "Vos informations ont été mises à jour avec succès.",
          })
        }
      } catch (error) {
        console.error('Error in auth state change:', error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue. Veuillez réessayer.",
        })
      }
    })
    
    return () => subscription.unsubscribe()
  }, [navigate, toast])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Assistant Pédagogique IA
          </h1>
          <p className="text-lg text-muted-foreground">
            Connectez-vous pour continuer votre apprentissage
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Bienvenue</CardTitle>
            <CardDescription>
              Choisissez une option pour continuer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sign_up" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="sign_in">Connexion</TabsTrigger>
                <TabsTrigger value="sign_up">Inscription</TabsTrigger>
              </TabsList>
              <TabsContent value="sign_in">
                <Auth
                  supabaseClient={supabase}
                  view="sign_in"
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: 'hsl(var(--primary))',
                          brandAccent: 'hsl(var(--primary))',
                        },
                      },
                    },
                    className: {
                      container: "space-y-4",
                      label: "text-foreground",
                      button: "w-full bg-primary text-primary-foreground hover:bg-primary/90",
                      divider: "my-4",
                      message: "text-sm text-destructive mt-2",
                      input: "bg-background",
                    },
                  }}
                  providers={[]}
                  redirectTo={`${window.location.origin}/chat`}
                  localization={{
                    variables: {
                      sign_in: {
                        email_label: "Adresse email",
                        password_label: "Mot de passe",
                        button_label: "Se connecter",
                        loading_button_label: "Connexion en cours...",
                        email_input_placeholder: "Votre adresse email",
                        password_input_placeholder: "Votre mot de passe",
                        link_text: "",
                      }
                    }
                  }}
                />
              </TabsContent>
              <TabsContent value="sign_up">
                <Auth
                  supabaseClient={supabase}
                  view="sign_up"
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: 'hsl(var(--primary))',
                          brandAccent: 'hsl(var(--primary))',
                        },
                      },
                    },
                    className: {
                      container: "space-y-4",
                      label: "text-foreground",
                      button: "w-full bg-primary text-primary-foreground hover:bg-primary/90",
                      divider: "my-4",
                      message: "text-sm text-destructive mt-2",
                      input: "bg-background",
                    },
                  }}
                  providers={[]}
                  redirectTo={`${window.location.origin}/chat`}
                  localization={{
                    variables: {
                      sign_up: {
                        email_label: "Adresse email",
                        password_label: "Mot de passe",
                        button_label: "S'inscrire",
                        loading_button_label: "Inscription en cours...",
                        email_input_placeholder: "Votre adresse email",
                        password_input_placeholder: "Votre mot de passe",
                        link_text: "",
                        confirmation_text: "Vérifiez vos emails pour confirmer votre inscription",
                      }
                    }
                  }}
                  additionalData={{
                    first_name: {
                      type: "text",
                      label: "Prénom",
                      placeholder: "Votre prénom",
                      required: true,
                      order: 1,
                    },
                  }}
                  onSubmit={handleSignUp}
                />
                <div className="mt-4 space-y-4">
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
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login