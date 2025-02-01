import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { SignInForm } from "@/components/landing/auth/SignInForm"
import { SignUpForm } from "@/components/landing/auth/SignUpForm"
import { ForgotPasswordForm } from "@/components/landing/auth/ForgotPasswordForm"
import { PasswordResetForm } from "@/components/landing/auth/PasswordResetForm"
import { SEO } from "@/components/SEO"
import { useToast } from "@/hooks/use-toast"

export default function Login() {
  const location = useLocation()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const verifyMagicLink = async () => {
      // Get the current URL's query parameters
      const params = new URLSearchParams(window.location.search)
      const error = params.get("error")
      const error_description = params.get("error_description")

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error_description || "Une erreur est survenue lors de la connexion.",
        })
      }

      setIsLoading(false)
    }

    verifyMagicLink()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <SEO
        title="Connexion | PedagoIA - Assistant pédagogique intelligent"
        description="Connectez-vous à votre compte PedagoIA pour accéder à votre assistant pédagogique intelligent."
      />
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-primary" />
          <Link to="/" className="relative z-20 flex items-center text-lg font-medium">
            <img src="/lovable-uploads/a514063e-400f-4c84-b2f2-78114e277365.png" alt="PedagoIA Logo" className="h-8" />
          </Link>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "PedagoIA m'a permis de gagner un temps précieux dans la préparation de mes cours. Je peux maintenant me
                concentrer sur l'essentiel : l'accompagnement de mes élèves."
              </p>
              <footer className="text-sm">Sophie Dubois</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Bienvenue sur PedagoIA</h1>
              <p className="text-sm text-muted-foreground">
                Connectez-vous à votre compte pour accéder à votre assistant pédagogique
              </p>
            </div>
            {location.pathname === "/login/signup" ? (
              <SignUpForm />
            ) : location.pathname === "/login/forgot-password" ? (
              <ForgotPasswordForm />
            ) : location.pathname === "/login/reset-password" ? (
              <PasswordResetForm />
            ) : (
              <SignInForm />
            )}
          </div>
        </div>
        <footer className="absolute bottom-0 left-0 right-0 p-4 text-center lg:hidden">
          <div className="flex justify-center space-x-4">
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </footer>
      </div>
    </>
  )
}