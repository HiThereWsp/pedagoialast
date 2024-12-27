import React from 'react'
import { ArrowRight, Star } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent } from '../ui/dialog'
import { WaitlistForm } from './WaitlistForm'
import { DynamicText } from './DynamicText'

export function HeroSection() {
  const [showWaitlistForm, setShowWaitlistForm] = React.useState(false)

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground block mb-4">L'assistant pédagogique</span>
            <span className="text-foreground">qui vous aide à </span>
            <DynamicText />
          </h1>
          <Button 
            size="lg"
            onClick={() => setShowWaitlistForm(true)}
            className="bg-primary text-white hover:bg-primary/90 transition-all duration-200 text-lg px-8 py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 mb-6 group"
          >
            <Star className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform" />
            Être informé.e de la sortie
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Accès prioritaire et tarif exclusif pour les premiers inscrits
          </p>
        </div>
      </div>
      <Dialog open={showWaitlistForm} onOpenChange={setShowWaitlistForm}>
        <DialogContent className="sm:max-w-[425px]">
          <WaitlistForm />
        </DialogContent>
      </Dialog>
    </section>
  )
}