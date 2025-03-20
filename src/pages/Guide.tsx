
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEO } from "@/components/SEO";
import { Header } from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import { GuideHeroSection } from "@/components/guide/HeroSection";
import { GuideContent } from "@/components/guide/GuideContent";
import { posthog } from '@/integrations/posthog/client';

const Guide = () => {
  const [searchParams] = useSearchParams();

  // Track page view with UTM parameters
  useEffect(() => {
    posthog.capture('guide_page_viewed', {
      utm_source: searchParams.get('utm_source'),
      utm_medium: searchParams.get('utm_medium'),
      utm_campaign: searchParams.get('utm_campaign'),
      utm_content: searchParams.get('utm_content'),
      utm_term: searchParams.get('utm_term')
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO 
        title="Guide Complet PedagoIA : L'Assistant IA qui Révolutionne la Préparation des Cours" 
        description="Découvrez comment l'assistant pédagogique intelligent PedagoIA vous permet d'économiser jusqu'à 60% de votre temps de préparation tout en créant des contenus plus personnalisés pour vos élèves." 
        image="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
        article={true} 
      />
      
      <Header />
      
      <main className="flex-grow">
        <GuideHeroSection />
        <GuideContent />
        <FAQSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Guide;
