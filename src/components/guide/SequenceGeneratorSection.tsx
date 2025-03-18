
import React from 'react';
import { Clock } from 'lucide-react';

export function SequenceGeneratorSection() {
  return (
    <section id="generateur-sequences" className="space-y-8">
      <h2 className="text-3xl font-bold text-[#2c3e50] border-b border-gray-100 pb-4">
        Générateur de séquences pédagogiques
      </h2>
      
      <div className="bg-gray-50 rounded-xl p-6 text-center my-12 shadow-inner">
        <p className="text-gray-500">[Vidéo/GIF montrant la création d'une séquence]</p>
      </div>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-8">
        L'un des outils les plus appréciés de PedagoIA est le <strong className="text-[#2c3e50]">générateur de séquences pédagogiques</strong> qui vous permet de créer des progressions complètes en quelques clics.
      </p>
      
      <h3 className="text-2xl font-semibold mt-12 mb-6 text-[#3d4852]">Comment créer une séquence pédagogique</h3>
      
      <ol className="list-none space-y-6 mb-12 pl-0">
        <li className="flex items-start">
          <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">1</span>
          <span className="text-lg">Depuis votre tableau de bord, cliquez sur "Générateur de séquences"</span>
        </li>
        <li className="flex items-start">
          <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">2</span>
          <span className="text-lg">Sélectionnez votre niveau d'enseignement et votre matière</span>
        </li>
        <li className="flex items-start">
          <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">3</span>
          <span className="text-lg">Précisez la thématique de votre séquence</span>
        </li>
        <li className="flex items-start">
          <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">4</span>
          <span className="text-lg">Indiquez le nombre de séances souhaitées et leur durée</span>
        </li>
        <li className="flex items-start">
          <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">5</span>
          <span className="text-lg">Ajoutez des contraintes spécifiques (matériel disponible, approche pédagogique, etc.)</span>
        </li>
        <li className="flex items-start">
          <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">6</span>
          <span className="text-lg">Cliquez sur "Générer ma séquence"</span>
        </li>
      </ol>
      
      <div className="relative overflow-hidden bg-white border-l-4 border-green-400 rounded-lg shadow-md p-6 my-12 hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="flex items-start gap-4 relative z-10">
          <Clock className="text-green-600 flex-shrink-0 mt-1" size={28} />
          <div className="space-y-2 text-left">
            <h4 className="text-xl font-semibold text-green-700">Temps économisé</h4>
            <p className="text-lg leading-relaxed text-gray-700">
              Une séquence pédagogique complète générée en <strong className="text-green-800 text-xl">moins d'une minute</strong>, contre <span className="line-through text-gray-500">3 à 5 heures</span> de préparation traditionnelle. Soit une économie moyenne de <strong className="text-green-800 text-xl">4h30</strong> par séquence !
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
