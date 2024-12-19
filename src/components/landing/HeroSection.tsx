import { useState } from "react"
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