import React from 'react';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ne manquez pas cette opportunité unique
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rejoignez la communauté des premiers utilisateurs et bénéficiez d'avantages exclusifs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 transition-all duration-200 text-lg px-8 py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 group w-full sm:w-auto"
            >
              <Star className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform" />
              Je réserve ma place
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-200 text-lg px-8 py-6 rounded-xl transform hover:scale-105 group w-full sm:w-auto"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform text-primary" />
              Découvrir les avantages
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Places limitées pour la phase de lancement • Tarif préférentiel garanti
          </p>
        </div>
      </div>
    </section>
  );
}