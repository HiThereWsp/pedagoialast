
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
import { SecondaryTestimonialSection } from "@/components/landing/SecondaryTestimonialSection";
import { ToolsSection } from "@/components/landing/ToolsSection";
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
        
        {/* Section Témoignage Secondaire avec nouveau composant */}
        <SecondaryTestimonialSection />
        
        {/* Section Comment Ça Marche */}
        <HowItWorksSection />
        
        {/* Section Outils */}
        <ToolsSection />
        
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
