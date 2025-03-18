
import React from 'react';
import { Clock } from 'lucide-react';

export function ExercisesSection() {
  return (
    <section id="exercices-evaluations" className="space-y-8">
      <h2 className="text-3xl font-bold text-[#2c3e50] border-b border-gray-100 pb-4">
        Créer des exercices et des évaluations
      </h2>
      
      <div className="bg-gray-50 rounded-xl p-6 text-center my-12 shadow-inner">
        <p className="text-gray-500">[Vidéo/GIF montrant la création d'exercices]</p>
      </div>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-8">
        La création d'exercices pertinents et variés est l'une des tâches les plus chronophages pour les enseignants. PedagoIA simplifie ce processus grâce à son <strong className="text-[#2c3e50]">générateur d'exercices intelligent</strong>.
      </p>
      
      <div className="relative overflow-hidden bg-white border-l-4 border-green-400 rounded-lg shadow-md p-6 my-12 hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="flex items-start gap-4 relative z-10">
          <Clock className="text-green-600 flex-shrink-0 mt-1" size={28} />
          <div className="space-y-2 text-left">
            <h4 className="text-xl font-semibold text-green-700">Temps économisé</h4>
            <p className="text-lg leading-relaxed text-gray-700">
              Création d'un exercice complet avec corrigé en <strong className="text-green-800 text-xl">30 secondes</strong>, contre <span className="line-through text-gray-500">20 à 30 minutes</span> en moyenne par exercice traditionnellement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
