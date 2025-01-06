import React from 'react'
import { ArrowRight, Star } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { WaitlistForm } from './WaitlistForm'
import { DynamicText } from './DynamicText'

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
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-secondary/5">
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-fade-in">
            <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-sm font-medium mb-6 inline-flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Bientôt disponible
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground block mb-4">Préparez vos classes</span>
            <span className="bg-gradient-to-r from-coral-400 to-violet-500 bg-clip-text text-transparent">
              10x plus vite
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Gagnez en efficacité et concentrez-vous sur l'essentiel : vos élèves !
          </p>
          <div className="flex flex-col items-center gap-6 mb-8">
            <Button 
              size="lg"
              onClick={() => setShowWaitlistForm(true)}
              className="bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-lg px-8 py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 animate-shimmer -z-10" />
              <Star className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform" />
              Je rejoins la liste d'attente
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground">
              🎁 <span className="font-medium">Offre de lancement</span> • Accès prioritaire et tarif exclusif
            </p>
          </div>
        </div>
      </div>
      <Dialog open={showWaitlistForm} onOpenChange={setShowWaitlistForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Rejoignez la liste d'attente</DialogTitle>
          <DialogDescription>
            Inscrivez-vous pour être parmi les premiers à tester PedagoIA
          </DialogDescription>
          <WaitlistForm />
        </DialogContent>
      </Dialog>
    </section>
  )
}