
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { MetricsSection } from "@/components/landing/MetricsSection";
import { posthog } from '@/integrations/posthog/client';

const Bienvenue = () => {
  const [searchParams] = useSearchParams();
  
  // Track redirect information if present
  useEffect(() => {
    const ref = searchParams.get('ref');
    const rid = searchParams.get('rid');
    
    if (ref) {
      // Save referral info to localStorage for later use (e.g., promo codes)
      localStorage.setItem('pedago_ref', ref);
      
      if (rid) {
        localStorage.setItem('pedago_redirect_id', rid);
        localStorage.setItem('pedago_redirect_time', new Date().toISOString());
      }
      
      // Track page visit with referral info in PostHog
      posthog.capture('bienvenue_page_viewed', {
        ref_source: ref,
        redirect_id: rid,
        utm_source: searchParams.get('utm_source'),
        utm_medium: searchParams.get('utm_medium'),
        utm_campaign: searchParams.get('utm_campaign'),
        utm_content: searchParams.get('utm_content'),
        utm_term: searchParams.get('utm_term')
      });
    }
  }, [searchParams]);

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
        
        {/* Section Metrics */}
        <MetricsSection />
        
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
