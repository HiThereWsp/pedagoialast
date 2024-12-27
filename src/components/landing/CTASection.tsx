import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '../ui/button';

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Soyez parmi les premiers à transformer l'enseignement avec l'IA
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez la liste d'attente et bénéficiez d'un accès prioritaire et d'un tarif exclusif de lancement.
          </p>
          <Button 
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 transition-all duration-200 text-lg px-8 py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 group"
          >
            <Star className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform" />
            Je rejoins la liste d'attente
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}