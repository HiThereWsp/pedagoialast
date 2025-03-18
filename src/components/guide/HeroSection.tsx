import React from 'react';
import { Link } from 'react-router-dom';
import { Tiles } from "@/components/ui/tiles";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
export function GuideHeroSection() {
  return <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="absolute inset-0 opacity-25">
        <Tiles rows={50} cols={8} tileSize="md" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-8">
            <img src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" alt="PedagoIA Logo" className="h-24 mx-auto" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-balance leading-tight tracking-tight text-[#1a365d]">Guide complet PedagoIA</h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-balance leading-tight tracking-tight text-[#1a365d]">L'Assistant IA qui Révolutionne l'enseignement</h2>
          
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">Découvrez comment l'assistant pédagogique intelligent PedagoIA vous permet d'économiser jusqu'à 60% de votre temps de préparation de cours tout en créant des contenus plus personnalisés pour vos élèves.</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-lg px-8 py-6 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 group">
                J'essaie gratuitement
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>;
}