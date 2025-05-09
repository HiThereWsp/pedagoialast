import React, { useEffect } from 'react';
import { LessonPlanCreator } from '@/components/lesson-plan/LessonPlanCreator';
import { useIsMobile } from '@/hooks/use-mobile';
import { FORM_STORAGE_KEY, RESULT_STORAGE_KEY } from '@/hooks/lesson-plan/types';
import { SEO } from '@/components/SEO';

const LessonPlanPage = () => {
  const isMobile = useIsMobile();
  
  // Clear cached data when first visiting the page
  useEffect(() => {
    // Check if this is a fresh page load (not a return from history)
    if (performance.navigation?.type === 1 || !performance.navigation) {
      console.log('Fresh page load of lesson plan page, clearing old cache');
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(RESULT_STORAGE_KEY);
    }
  }, []);
  
  return (
    <>
      <SEO 
        title="Générateur de séquences pédagogiques | PedagoIA"
        description="Créez des séquences pédagogiques adaptées à votre classe en quelques clics grâce à l'IA."
      />
      <div className="container mx-auto py-4 px-4">
        <div className="text-center mb-6">
          <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-extrabold mb-2 tracking-tight text-balance max-w-lg mx-auto`}>
            <span className="bg-gradient-to-r from-[#FFE29F] to-[#FF719A] bg-clip-text text-transparent">Générateur de séquences</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500">
            Créez des séquences pédagogiques adaptées à votre classe en quelques clics.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <LessonPlanCreator />
          </div>
        </div>
      </div>
    </>
  );
}

export default LessonPlanPage;
