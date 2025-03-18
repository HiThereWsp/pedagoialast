
import React from 'react';
import { Clock, Zap, Target, PenTool, Scale } from 'lucide-react';

export function ExercisesSection() {
  return (
    <section id="exercices-evaluations" className="space-y-12">
      <h2 className="text-3xl font-bold text-slate-800 border-b border-gray-100 pb-4">
        Créer des exercices et des évaluations
      </h2>
      
      <div className="bg-gray-50 rounded-xl p-8 text-center my-10 shadow-inner">
        <p className="text-gray-500">[Vidéo/GIF montrant la création d'exercices]</p>
      </div>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-8">
        La création d'exercices pertinents et variés est l'une des tâches les plus chronophages pour les enseignants. PedagoIA simplifie ce processus grâce à son <strong className="text-slate-800">générateur d'exercices intelligent</strong>.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
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
        
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start gap-6">
            <div className="bg-blue-100 p-4 rounded-full shadow-sm">
              <Scale className="text-blue-600 flex-shrink-0" size={32} />
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-blue-700">Adaptabilité automatique</h4>
              <p className="text-lg leading-relaxed text-gray-700">
                Adapte automatiquement le niveau de difficulté des exercices en fonction du profil des élèves et de leurs besoins.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start gap-6">
            <div className="bg-purple-100 p-4 rounded-full shadow-sm">
              <Target className="text-purple-600 flex-shrink-0" size={32} />
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-purple-700">Précision pédagogique</h4>
              <p className="text-lg leading-relaxed text-gray-700">
                Cible exactement les compétences et notions que vous souhaitez faire travailler, alignées avec les programmes officiels.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start gap-6">
            <div className="bg-amber-100 p-4 rounded-full shadow-sm">
              <PenTool className="text-amber-600 flex-shrink-0" size={32} />
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-amber-700">Corrigés détaillés</h4>
              <p className="text-lg leading-relaxed text-gray-700">
                Chaque exercice est accompagné d'un corrigé complet expliquant la démarche pas à pas pour faciliter l'auto-évaluation.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-100 my-8">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Fonctionnalités principales</h4>
        <ul className="list-disc pl-5 space-y-3 text-gray-700">
          <li><strong>Variété de formats</strong> : QCM, questions ouvertes, textes à trous, schémas à compléter...</li>
          <li><strong>Différenciation intégrée</strong> : Adaptation automatique au niveau des élèves</li>
          <li><strong>Exportation facile</strong> : Format texte brut pour intégration dans vos documents</li>
          <li><strong>Historique sauvegardé</strong> : Retrouvez facilement vos exercices précédemment créés</li>
        </ul>
      </div>
    </section>
  );
}
