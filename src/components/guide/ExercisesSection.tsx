
import React from 'react';
import { Clock } from 'lucide-react';

export function ExercisesSection() {
  return (
    <section id="exercices-evaluations" className="space-y-20">
      <h2 className="text-3xl font-bold text-slate-800 border-b border-gray-100 pb-4">
        Créer des exercices et des évaluations
      </h2>
      
      <div className="bg-gray-50 rounded-xl p-8 text-center my-16 shadow-inner">
        <p className="text-gray-500">[Vidéo/GIF montrant la création d'exercices]</p>
      </div>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-12">
        La création d'exercices pertinents et variés est l'une des tâches les plus chronophages pour les enseignants. PedagoIA simplifie ce processus grâce à son <strong className="text-slate-800">générateur d'exercices intelligent</strong>.
      </p>
      
      <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 my-16">
        <div className="flex items-start gap-6">
          <div className="bg-green-100 p-4 rounded-full shadow-sm">
            <Clock className="text-green-600 flex-shrink-0" size={32} />
          </div>
          <div className="space-y-3">
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
