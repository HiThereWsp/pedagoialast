import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DynamicText } from "./DynamicText"
import { LoginForm } from "./LoginForm"

export const HeroSection = () => {
  const [showLoginForm, setShowLoginForm] = useState(false)

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Titre principal avec texte dynamique */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground block mb-4">
              Votre assistant pédagogique
            </span>
            <span className="text-foreground">qui vous aide à </span>
            <DynamicText />
          </h1>

          {/* Bouton d'action principal */}
          <Button 
            size="lg"
            onClick={() => setShowLoginForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-8"
          >
            Je m'inscris maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Sous-titre */}
          <p className="text-xl md:text-2xl text-emerald-600">
            L'IA pensée pour simplifier votre métier.
          </p>
        </div>
      </div>

      {/* Modal de connexion */}
      <Dialog open={showLoginForm} onOpenChange={setShowLoginForm}>
        <DialogContent className="sm:max-w-[425px]">
          <LoginForm />
        </DialogContent>
      </Dialog>
    </section>
  )
}