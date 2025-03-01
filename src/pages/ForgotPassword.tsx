
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { SEO } from "@/components/SEO"
import { Link } from "react-router-dom"
import { ForgotPasswordForm } from "@/components/landing/auth/ForgotPassowrdForm";
import { Button } from "@/components/ui/button"

export default function ForgotPassword() {
  const navigate = useNavigate()
  
  return (
    <>
      <SEO 
        title="Mot de passe oublié | PedagoIA - Assistant pédagogique intelligent"
        description="Réinitialisez votre mot de passe PedagoIA pour récupérer l'accès à votre compte."
      />
      <div className="flex min-h-screen flex-col items-center justify-between bg-background">
        <div className="w-full flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <img 
                src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                alt="PedagoIA Logo" 
                className="w-[100px] h-[120px] object-contain mx-auto mb-4" 
              />
              <h1 className="text-2xl font-bold">Réinitialisation du mot de passe</h1>
              <p className="text-muted-foreground mt-2">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <ForgotPasswordForm />
              </CardContent>
            </Card>
            <div className="text-center">
              <Button 
                variant="link" 
                className="text-sm text-muted-foreground" 
                onClick={() => navigate("/login")}
              >
                Retour à la connexion
              </Button>
            </div>
          </div>
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
