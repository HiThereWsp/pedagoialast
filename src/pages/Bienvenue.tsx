
import React from 'react';
import { SEO } from "@/components/SEO";
import { Header } from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { HeroSectionBienvenue } from "@/components/landing/HeroSectionBienvenue";
import { CopiloteSection } from "@/components/landing/CopiloteSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { TestimonialMainSection } from "@/components/landing/TestimonialMainSection";
import { ToolsSection } from "@/components/landing/ToolsSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Tiles } from "@/components/ui/tiles";

const Bienvenue = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Pedago.ia - L'IA au service des enseignants" 
        description="Libérez du temps. Enseignez pleinement. Pedago.ia vous aide à reprendre le contrôle sur votre temps."
      />
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSectionBienvenue />
        
        {/* Section Copilote */}
        <CopiloteSection />
        
        {/* Section Avant/Après */}
        <ComparisonSection />

        {/* Section Témoignage Principal */}
        <TestimonialMainSection />
        
        {/* Section Comment Ça Marche */}
        <HowItWorksSection />
        
        {/* Section Outils */}
        <ToolsSection />
        
        {/* CTA avant FAQ */}
        <section className="py-16 bg-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Tiles 
              rows={50}
              cols={8}
              tileSize="md"
            />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6">Prêt à transformer votre manière d'enseigner ?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Rejoignez notre communauté d'enseignants et échangez des astuces et bonnes pratiques
              </p>
              
              <Button 
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-lg px-8 py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 group"
              >
                Je rejoins la communauté
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="mt-4 text-sm text-muted-foreground">
                Déjà plus de 500 enseignants dans notre communauté
              </p>
            </div>
          </div>
        </section>
        
        {/* Section FAQ */}
        <FAQSection />
        
        {/* Section Témoignages */}
        <TestimonialsSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Bienvenue;
