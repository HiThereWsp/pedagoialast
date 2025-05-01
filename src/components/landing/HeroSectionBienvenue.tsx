import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Tiles } from "@/components/ui/tiles";
import { AnimatedText } from "@/components/ui/animated-text";
import { PromoButton } from "@/components/ui/promo-button";

export function HeroSectionBienvenue() {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0 opacity-25">
        <Tiles rows={50} cols={8} tileSize="md" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-fade-in">
            <div className="flex items-center rounded-full border border-border bg-background p-1 shadow shadow-black/5 mb-8">
              <div className="flex -space-x-1.5">
                <img className="rounded-full ring-1 ring-background" src="https://originui.com/avatar-80-03.jpg" width={20} height={20} alt="Avatar 01" />
                <img className="rounded-full ring-1 ring-background" src="https://originui.com/avatar-80-04.jpg" width={20} height={20} alt="Avatar 02" />
                <img className="rounded-full ring-1 ring-background" src="https://originui.com/avatar-80-05.jpg" width={20} height={20} alt="Avatar 03" />
                <img className="rounded-full ring-1 ring-background" src="https://originui.com/avatar-80-06.jpg" width={20} height={20} alt="Avatar 04" />
              </div>
              <p className="px-2 text-xs text-muted-foreground">
                +1000 enseignants utilisent l'IA au quotidien.
              </p>
            </div>
          </div>
          
          <h1 className="text-5xl font-extrabold mb-6 text-balance leading-tight tracking-tight md:text-5xl">L'assistant pédagogique IA pour travailler 15x plus vite</h1>
          
          <h2 className="text-2xl md:text-3xl mb-6">
            Avec des outils IA conçus pour <br className="hidden sm:block" /> 
            <AnimatedText phrases={["planifier vos cours", "générer du contenu pédagogique", "évaluer vos élèves", "différencier en quelques clics", "gagner du temps"]} className="bg-gradient-to-r from-yellow-400 via-coral-400 to-pink-400 text-transparent bg-clip-text" />
          </h2>
          
          <Link to="/login">
            <Button size="lg" className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-lg px-8 py-6 rounded-full shadow-premium hover:shadow-premium-lg transform hover:scale-105 group">
              J'essaie gratuitement
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <p className="mt-4 text-sm text-muted-foreground">
            Tarif préférentiel pour les 2000 premiers enseignants.
          </p>

          <div className="mt-4 flex justify-center">
            <PromoButton />
          </div>
        </div>
      </div>
    </section>;
}
