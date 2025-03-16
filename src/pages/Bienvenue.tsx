
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
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/components/home/UserMenu';
import { WelcomeMessage } from '@/components/home/WelcomeMessage';
import { ActionButtons } from '@/components/home/ActionButtons';
import { UpdateNotification } from '@/components/home/UpdateNotification';
import { useEffect as useEffectState, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";

const Bienvenue = () => {
  const [searchParams] = useSearchParams();
  const { user, authReady } = useAuth();
  const [firstName, setFirstName] = useState<string>("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
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

  useEffectState(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsProfileLoading(true);
        console.log("Chargement du profil utilisateur...");
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }
        
        if (profile) {
          console.log("Profil chargé:", profile.first_name);
          setFirstName(profile.first_name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };
    
    if (authReady && user) {
      loadUserProfile();
    }
  }, [user, authReady]);

  // Si l'utilisateur est connecté, afficher la page d'accueil personnalisée
  if (user) {
    if (isProfileLoading) {
      return <HomeSkeleton />;
    }

    return (
      <>
        <SEO
          title="Tableau de bord | PedagoIA - Votre assistant pédagogique"
          description="Accédez à tous vos outils pédagogiques et gérez vos contenus depuis votre tableau de bord personnalisé."
        />
        <div className="relative min-h-screen">
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-50" />
          </div>
          <div className="relative z-10 min-h-screen flex flex-col items-center px-6 py-8 max-w-md mx-auto">
            <UserMenu />
            <WelcomeMessage firstName={firstName} />
            <ActionButtons />
            <Footer />
            <UpdateNotification />
          </div>
        </div>
      </>
    );
  }

  // Sinon, afficher la page de bienvenue publique
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
