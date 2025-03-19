
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SEO } from "@/components/SEO";
import { Header } from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";
import { GuideHeroSection } from "@/components/guide/HeroSection";
import { GuideContent } from "@/components/guide/GuideContent";
import { posthog } from '@/integrations/posthog/client';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const Guide = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

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

  const handleFixAmbassadorSubscription = async () => {
    if (!email || !email.includes('@')) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('fix-ambassador-subscription', {
        body: { email }
      });

      if (error) {
        console.error("Error fixing ambassador subscription:", error);
        toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
      } else {
        console.log("Fix ambassador subscription result:", data);
        toast.success(`Abonnement ambassadeur réparé pour ${email}`);
        setEmail('');
      }
    } catch (err) {
      console.error("Exception during ambassador fix:", err);
      toast.error(`Exception: ${err.message || "Une erreur inattendue est survenue"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAdminPanel = () => {
    setIsAdminPanelOpen(!isAdminPanelOpen);
  };

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
        
        {/* Admin panel access - hidden by default */}
        <div className="container mx-auto py-4 my-4">
          <div className="flex justify-end">
            <button 
              onClick={toggleAdminPanel}
              className="text-xs text-gray-400 hover:text-gray-600"
              aria-label="Toggle admin panel"
            >
              •••
            </button>
          </div>
          
          {isAdminPanelOpen && (
            <div className="border border-gray-200 rounded-lg p-4 mt-2 bg-gray-50">
              <h3 className="text-sm font-medium mb-2">Panneau d'administration</h3>
              <div className="space-y-2">
                <div className="text-xs text-gray-500 mb-2">
                  Réparer un abonnement ambassadeur:
                </div>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-sm h-8"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleFixAmbassadorSubscription}
                    disabled={isSubmitting}
                    className="h-8"
                  >
                    {isSubmitting ? "En cours..." : "Réparer l'accès"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Guide;
