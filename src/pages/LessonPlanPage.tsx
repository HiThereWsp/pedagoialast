
import React from 'react';
import { LessonPlanCreator } from '@/components/lesson-plan/LessonPlanCreator';
import { Header } from '@/components/lesson-plan/Header';
import { BackButton } from "@/components/settings/BackButton";
import { SEO } from "@/components/SEO";

const LessonPlanPage = () => {
  return (
    <>
      <SEO 
        title="Générateur de séquences | PedagoIA - Planification pédagogique"
        description="Créez des séquences pédagogiques complètes et adaptées à vos objectifs d'apprentissage avec notre assistant intelligent."
      />
      <div className="container mx-auto py-8">
        <BackButton />
        <div className="text-center pt-8 pb-4">
          <img 
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
            alt="PedagoIA Logo" 
            className="w-[100px] h-[120px] object-contain mx-auto mb-4" 
          />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent">
            Générateur de séquences
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Créez facilement des séquences pédagogiques adaptées à vos besoins et objectifs d'apprentissage.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <Header />
          <LessonPlanCreator />
        </div>
      </div>
    </>
  );
}

export default LessonPlanPage;
