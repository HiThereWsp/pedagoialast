
import React from 'react';
import { LessonPlanCreator } from '@/components/lesson-plan/LessonPlanCreator';
import { Header } from '@/components/lesson-plan/Header';
import { useIsMobile } from '@/hooks/use-mobile';

const LessonPlanPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="container mx-auto py-4 px-4">
      <div className="text-center mb-8">
        <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-extrabold mb-2 bg-gradient-to-r from-[#FFE29F] to-[#FF719A] bg-clip-text text-transparent leading-tight tracking-tight text-balance`}>
          Générateur de séquences
        </h1>
        <p className="max-w-2xl mx-auto text-slate-500">
          Créez des séquences pédagogiques adaptées à votre classe en quelques clics.
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <Header />
          <LessonPlanCreator />
        </div>
      </div>
    </div>
  );
};

export default LessonPlanPage;
