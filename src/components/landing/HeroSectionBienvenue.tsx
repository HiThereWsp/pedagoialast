
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DynamicText } from "@/components/landing/DynamicText";
import { Tiles } from "@/components/ui/tiles";

export function HeroSectionBienvenue() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      <div className="absolute inset-0 opacity-20">
        <Tiles 
          rows={50}
          cols={8}
          tileSize="md"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-fade-in">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 inline-flex items-center gap-1">
              Découvrez PedagoIA
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-balance leading-tight tracking-tight">
            L'assistant pédagogique intelligent
          </h1>
          
          <h2 className="text-2xl md:text-3xl mb-6">
            L'IA qui t'aide à <DynamicText /> en quelques clics
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12">
            Rejoignez plus de 500 enseignants qui gagnent 10h par semaine avec PedagoIA
          </p>
          
          <Button 
            size="lg"
            className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-lg px-8 py-6 rounded-full shadow-premium hover:shadow-premium-lg transform hover:scale-105 group"
          >
            J'essaie gratuitement
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="mt-4 text-sm text-muted-foreground">
            Tarif préférentiel pour les 1000 premiers enseignants.
          </p>
        </div>
      </div>
    </section>
  );
}
