import React from 'react'
import { ArrowRight, Star } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { WaitlistForm } from './WaitlistForm'
import { DynamicText } from './DynamicText'
import { SEO } from '../SEO'

export function HeroSection() {
  const [showWaitlistForm, setShowWaitlistForm] = React.useState(false)

  React.useEffect(() => {
    const handleClose = () => {
      setShowWaitlistForm(false)
    }

    window.addEventListener('close', handleClose)
    return () => window.removeEventListener('close', handleClose)
  }, [])

  return (
    <>
      <SEO 
        title="PedagoIA - L'assistant qui révolutionne la préparation des cours"
        description="Créez des contenus pédagogiques personnalisés et innovants en quelques clics grâce à l'intelligence artificielle."
      />
      <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-gradient-to-b from-white to-secondary/5">
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-fade-in">
            <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6 inline-flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Bientôt disponible
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-clip-text">
            <span className="text-foreground block mb-2 sm:mb-4">L'assistant pédagogique</span>
            <span className="text-foreground">qui vous aide à </span>
            <DynamicText />
          </h1>
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Button 
              size="lg"
              onClick={() => setShowWaitlistForm(true)}
              className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 animate-shimmer -z-10" />
              <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-45 transition-transform" />
              Je rejoins la liste d'attente
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground">
              🎁 <span className="font-medium">Offre de lancement</span> • Accès prioritaire et tarif exclusif
            </p>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Rejoignez la communauté des premiers utilisateurs et transformez votre façon d'enseigner
          </p>
        </div>
      </div>
      <Dialog open={showWaitlistForm} onOpenChange={setShowWaitlistForm}>
        <DialogContent className="sm:max-w-[425px] mx-4 sm:mx-auto">
          <DialogTitle>Rejoignez la liste d'attente</DialogTitle>
          <DialogDescription>
            Inscrivez-vous pour être parmi les premiers à tester PedagoIA
          </DialogDescription>
          <WaitlistForm />
        </DialogContent>
      </Dialog>
      </section>
    </>
  )
}
