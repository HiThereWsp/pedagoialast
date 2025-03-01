
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { SEO } from "@/components/SEO"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"
import { PasswordResetForm } from "@/components/landing/auth/PasswordResetForm.tsx";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [tokenError, setTokenError] = useState(false)
  const [tokenVerified, setTokenVerified] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  useEffect(() => {
    const verifyResetToken = async () => {
      setIsLoading(true)
      
      try {
        // Récupérer le type et le token des paramètres d'URL
        const type = searchParams.get("type")
        const token = searchParams.get("token_hash")
        
        console.log("Vérification des paramètres de récupération:", { 
          type, 
          token: token ? "présent" : "absent",
          url: window.location.href
        })
        
        if (!token || type !== "recovery") {
          setTokenError(true)
          setErrorMessage("Le lien de réinitialisation est invalide ou incomplet. Vérifiez que vous avez utilisé le lien complet de l'email.")
          console.error("Token ou type manquant/invalide:", { type, hasToken: !!token })
          setIsLoading(false)
          return
        }

        // Vérifier le token de récupération avec Supabase
        // Utiliser token_hash au lieu de token pour correspondre aux types attendus
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "recovery"
        })

        if (error) {
          console.error("Erreur de vérification du token:", error)
          setTokenError(true)
          setErrorMessage(error.message || "Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.")
          toast({
            variant: "destructive",
            title: "Erreur de vérification",
            description: "Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
            duration: 6000,
          })
        } else {
          setTokenVerified(true)
          console.log("Token de récupération vérifié avec succès:", data)
        }
      } catch (err) {
        console.error("Erreur inattendue lors de la vérification:", err)
        setTokenError(true)
        setErrorMessage("Une erreur technique s'est produite. Veuillez réessayer ou contacter le support.")
      } finally {
        setIsLoading(false)
      }
    }

    verifyResetToken()
  }, [searchParams, toast])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <img 
          src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
          alt="PedagoIA Logo" 
          className="w-[100px] h-[120px] object-contain mx-auto mb-4" 
        />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-sm text-muted-foreground">Vérification de votre lien de réinitialisation...</p>
      </div>
    </div>
  }

  return (
    <>
      <SEO 
        title="Réinitialisation du mot de passe | PedagoIA"
        description="Réinitialisez votre mot de passe PedagoIA en toute sécurité."
      />
      <div className="flex min-h-screen flex-col items-center justify-between bg-background">
        <div className="w-full flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <div className="text-center mb-6 pt-6">
              <img 
                src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                alt="PedagoIA Logo" 
                className="w-[100px] h-[120px] object-contain mx-auto mb-4" 
              />
              <h1 className="text-2xl font-bold">Réinitialisation du mot de passe</h1>
            </div>
            <CardContent className="pt-2 pb-6">
              {tokenVerified ? (
                <PasswordResetForm onSuccess={() => {
                  toast({
                    title: "Mot de passe mis à jour",
                    description: "Votre mot de passe a été modifié avec succès.",
                    variant: "default",
                  })
                  // Rediriger vers la page de connexion après 2 secondes
                  setTimeout(() => navigate("/login"), 2000)
                }} />
              ) : tokenError ? (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Lien invalide</AlertTitle>
                    <AlertDescription>
                      {errorMessage || "Le lien de réinitialisation est invalide ou a expiré."}
                    </AlertDescription>
                  </Alert>
                  <p className="text-sm text-muted-foreground mt-2">
                    Veuillez demander un nouveau lien de réinitialisation.
                  </p>
                  <Button 
                    onClick={() => navigate("/forgot-password")} 
                    className="w-full mt-4"
                  >
                    Demander un nouveau lien
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
        
        <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 PedagoIA. Tous droits réservés.
            </p>
            <div className="space-x-4">
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                Tarifs
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
