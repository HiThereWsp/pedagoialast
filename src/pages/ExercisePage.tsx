
import React from 'react';
import { Link } from "react-router-dom";
import { ExerciseForm } from "@/components/exercise/ExerciseForm";
import { ResultDisplay } from "@/components/exercise/ResultDisplay";
import { SEO } from "@/components/SEO";

export default function ExercisePage() {
  return (
    <>
      <SEO 
        title="Générateur d'exercices | PedagoIA - Création d'exercices différenciés" 
        description="Créez des exercices différenciés et adaptés à vos élèves avec notre assistant intelligent."
      />
      <div className="container mx-auto py-8">
        <Link to="/home" className="block mb-8">
          <img 
            src="/lovable-uploads/93d432b8-78fb-4807-ba55-719b6b6dc7ef.png" 
            alt="PedagoIA Logo" 
            className="w-[100px] h-[120px] object-contain mx-auto hover:scale-105 transition-transform duration-200" 
          />
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent">
            Générateur d'exercices
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Créez des exercices différenciés et adaptés à vos élèves en quelques clics.
          </p>
        </div>
        <ExerciseForm />
      </div>
    </>
  );
}
