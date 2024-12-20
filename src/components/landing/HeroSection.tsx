import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { DynamicText } from './DynamicText';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground block mb-4">Votre assistant pédagogique</span>
            <span className="text-foreground">qui vous aide à </span>
            <DynamicText />
          </h1>
          <Button 
            size="lg"
            onClick={() => navigate('/login')}
            className="bg-primary text-white hover:bg-primary/90 transition-all duration-200 text-lg px-8 py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 mb-6"
          >
            Je m'inscris maintenant
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-xl md:text-2xl text-muted-foreground">
            L'IA pensée pour simplifier votre métier.
          </p>
        </div>
      </div>
    </section>
  );
}