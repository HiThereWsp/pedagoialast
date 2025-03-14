
import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { LoginForm } from "@/components/landing/LoginForm"
import { SEO } from "@/components/SEO"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const verifyMagicLink = async () => {
      // Récupérer les paramètres de requête de l'URL actuelle
      const queryParams = new URLSearchParams(window.location.search);
      const token = queryParams.get("token_hash"); // Extraire la valeur du token
      
      if (token) {
        console.log("Token:", token);

        try {
          // Vérifier l'OTP en utilisant Supabase
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "magiclink", // Ajuster en fonction de votre cas d'utilisation
          });

          if (error) {
            console.error("Erreur de vérification du lien magique:", error.message);
          } else {
            console.log("Lien magique vérifié avec succès!");
            // Rediriger l'utilisateur vers le tableau de bord
            window.location.href = "/tableaudebord";
          }
        } catch (err) {
          console.error("Erreur inattendue lors de la vérification:", err);
        }
      } else {
        console.log("Aucun token trouvé dans l'URL.");
      }
    };

    verifyMagicLink();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true)
        console.log("Vérification de la session...")
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Erreur de session:", error)
          setIsLoading(false)
          // Ne pas afficher d'erreur pour les pages d'authentification
        } else if (session) {
          console.log("Session active trouvée:", session)
          const returnUrl = location.state?.returnUrl || '/tableaudebord'
          console.log("Redirection vers:", returnUrl)
          navigate(returnUrl, { replace: true })
        } else {
          console.log("Aucune session active trouvée")
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Erreur d'authentification:", error)
        setIsLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("État d'authentification modifié:", event, session)
      
      if (event === 'SIGNED_IN' && session) {
        console.log("Utilisateur connecté, redirection...")
        const returnUrl = location.state?.returnUrl || '/tableaudebord'
        console.log("Redirection vers:", returnUrl)
        navigate(returnUrl, { replace: true })
      } else {
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate, location.state, toast])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  }

  return (
    <>
      <SEO 
        title="Connexion | PedagoIA - Assistant pédagogique intelligent"
        description="Connectez-vous à votre compte PedagoIA pour accéder à votre assistant pédagogique personnel et optimiser votre enseignement."
      />
      <div className="flex min-h-screen flex-col items-center justify-between bg-background">
        <div className="w-full flex flex-col items-center p-4 py-8">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2">
              <img src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" alt="PedagoIA Logo" className="h-24 w-auto" />
            </Link>
          </div>
          
          <div className="w-full max-w-4xl mx-auto">
            <LoginForm />
          </div>
        </div>
        
        <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex flex-col md:flex-row h-14 items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2025 PedagoIA. Tous droits réservés.
            </p>
            <div className="space-x-4">
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:underline">
                Conditions d'utilisation
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:underline">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
