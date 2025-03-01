
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DynamicText } from "@/components/landing/DynamicText";

export function HeroSectionBienvenue() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-fade-in">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 inline-flex items-center gap-1">
              Découvrez PedagoIA
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-balance leading-tight tracking-tight">
            L'assistant pédagogique intelligent
          </h1>
          
          <h2 className="text-2xl md:text-3xl mb-12">
            L'IA qui t'aide à <DynamicText /> en quelques clics
          </h2>
          
          <Button 
            size="lg"
            className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-lg px-8 py-6 rounded-full shadow-premium hover:shadow-premium-lg transform hover:scale-105 group"
          >
            J'essaie gratuitement
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
