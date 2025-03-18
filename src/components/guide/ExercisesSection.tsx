
import React from 'react';

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
      
      <div className="pl-8 border-l-4 border-green-300 py-6 my-12">
        <h4 className="text-xl font-semibold text-green-800 mb-3">Temps économisé</h4>
        <p className="text-lg leading-relaxed text-green-700">
          Création d'un exercice complet avec corrigé en 30 secondes, contre 20 à 30 minutes en moyenne par exercice traditionnellement.
        </p>
      </div>
    </section>
  );
}
