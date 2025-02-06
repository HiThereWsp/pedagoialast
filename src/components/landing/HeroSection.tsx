
import React from 'react'
import { ArrowRight, PlayCircle, Star, ShieldCheck } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog'
import { WaitlistForm } from './WaitlistForm'
import { DynamicText } from './DynamicText'

export function HeroSection() {
  const [showSubscribeForm, setShowSubscribeForm] = React.useState(false)
  const [showVideo, setShowVideo] = React.useState(false)

  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-gradient-to-b from-white to-secondary/5">
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-fade-in">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6 inline-flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              🎁 Offre de lancement : -50% sur l'abonnement annuel
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 sm:mb-8">
            <span className="text-foreground block mb-2 sm:mb-4">Créez vos cours</span>
            <span className="text-foreground">
              <span className="text-primary">10x plus vite</span> avec
            </span>
            <DynamicText />
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-10">
            <Button 
              size="lg"
              onClick={() => setShowSubscribeForm(true)}
              className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 animate-shimmer -z-10" />
              Je profite de l'offre
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button 
              variant="outline"
              size="lg"
              onClick={() => setShowVideo(true)}
              className="w-full sm:w-auto group"
            >
              <PlayCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:text-primary transition-colors" />
              Voir la démo
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Essai gratuit 3 jours
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Satisfait ou remboursé
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Conforme RGPD
            </div>
          </div>

          <div className="max-w-3xl mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-primary/10">
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Rejoignez plus de <span className="font-semibold text-primary">2000 enseignants</span> qui utilisent PedagoIA pour créer des contenus pédagogiques personnalisés et innovants en quelques clics.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showSubscribeForm} onOpenChange={setShowSubscribeForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Commencez votre essai gratuit</DialogTitle>
          <DialogDescription>
            Profitez de 3 jours d'essai et de -50% sur l'abonnement annuel
          </DialogDescription>
          <WaitlistForm />
        </DialogContent>
      </Dialog>

      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogTitle>Découvrez PedagoIA en action</DialogTitle>
          <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/your-video-id"
              title="PedagoIA Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
