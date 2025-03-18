
import React from 'react';

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
      
      <div className="pl-8 border-l-4 border-green-300 py-6 my-12">
        <h4 className="text-xl font-semibold text-green-800 mb-3">Temps économisé</h4>
        <p className="text-lg leading-relaxed text-green-700">
          Une séquence pédagogique complète générée en moins d'une minute, contre 3 à 5 heures de préparation traditionnelle. Soit une économie moyenne de 4h30 par séquence !
        </p>
      </div>
    </section>
  );
}
