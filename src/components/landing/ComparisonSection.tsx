
import React from 'react';
import { Check, X } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

export function ComparisonSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <AnimatedGridPattern 
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className="[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-red-100 p-8 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">😞</span>
                <h3 className="text-2xl font-semibold text-destructive">Sans pedagogIA</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <X className="h-5 w-5 text-destructive shrink-0 mt-1 mr-2" />
                  <p>Trop de formalités, pas assez de temps</p>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-destructive shrink-0 mt-1 mr-2" />
                  <p>Soirées et week-ends passés à travailler</p>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-destructive shrink-0 mt-1 mr-2" />
                  <p>Des heures à corriger les copies</p>
                </li>
                <li className="flex items-start">
                  <X className="h-5 w-5 text-destructive shrink-0 mt-1 mr-2" />
                  <p>Pas assez de temps pour s'occuper des élèves</p>
                </li>
              </ul>
            </div>
            
            <div className="bg-[#F2FCE2] p-8 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-4">😎</span>
                <h3 className="text-2xl font-semibold text-primary">Avec pedagogIA</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                  <p>Automatisation des tâches répétitives</p>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                  <p>Planification optimisée</p>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                  <p>Des exercices et évaluations en un clic</p>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                  <p>Différentiation pédagogique en un clic</p>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-1 mr-2" />
                  <p>L'efficacité de plusieurs outils IA en un seul</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
