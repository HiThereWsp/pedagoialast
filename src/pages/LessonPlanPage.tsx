import React from 'react';
import { LessonPlanCreator } from '@/components/lesson-plan/LessonPlanCreator';
import { Header } from '@/components/lesson-plan/Header';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LessonPlanPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-orange-50 to-purple-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/home')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Button>
        <div className="max-w-none mx-auto flex flex-col items-center">
          <div className="w-full max-w-[1200px]">
            <Header />
            <LessonPlanCreator />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonPlanPage;