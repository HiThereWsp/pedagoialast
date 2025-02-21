
import React from 'react';
import { Link } from 'react-router-dom';
import { LessonPlanCreator } from '@/components/lesson-plan/LessonPlanCreator';
import { Header } from '@/components/lesson-plan/Header';
import { SEO } from "@/components/SEO";

const LessonPlanPage = () => {
  return (
    <>
      <SEO 
        title="Générateur de séquences | PedagoIA - Planification pédagogique"
        description="Créez des séquences pédagogiques complètes et adaptées à vos objectifs d'apprentissage avec notre assistant intelligent."
      />
      <div className="container mx-auto py-4 px-4 min-h-screen">
        <Link to="/home" className="block mb-4">
          <img 
            src="/lovable-uploads/20acd86e-07df-4e64-9a9a-7e0ae0df29f4.png" 
            alt="PedagoIA Logo" 
            className="w-[140px] h-[160px] object-contain mx-auto hover:scale-105 transition-transform duration-200" 
          />
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#FFE29F] to-[#FF719A] bg-clip-text text-transparent">
            Générateur de séquences
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Créez facilement des séquences pédagogiques adaptées à vos besoins et objectifs d'apprentissage.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <Header />
            <LessonPlanCreator />
          </div>
        </div>
      </div>
    </>
  );
}

export default LessonPlanPage;
