import React from 'react';
import { LessonPlanCreator } from '@/components/lesson-plan/LessonPlanCreator';
import { Header } from '@/components/lesson-plan/Header';
import { BackButton } from "@/components/settings/BackButton";

const LessonPlanPage = () => {
  return (
    <div className="container mx-auto py-8">
      <BackButton />
      <div className="mb-8 text-center">
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
  );
}

export default LessonPlanPage;