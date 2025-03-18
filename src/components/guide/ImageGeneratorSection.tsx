
import React from 'react';
import { Clock } from 'lucide-react';

export function ImageGeneratorSection() {
  return (
    <section id="generateur-images" className="space-y-8">
      <h2 className="text-3xl font-bold text-[#2c3e50] border-b border-gray-100 pb-4">
        Générateur d'images pédagogiques
      </h2>
      
      <div className="bg-gray-50 rounded-xl p-6 text-center my-12 shadow-inner">
        <p className="text-gray-500">[Vidéo/GIF montrant la génération d'images]</p>
      </div>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-8">
        Les supports visuels améliorent considérablement l'engagement des élèves. PedagoIA intègre un <strong className="text-[#2c3e50]">générateur d'images pédagogiques</strong> pour illustrer vos cours sans effort.
      </p>
      
      <div className="relative overflow-hidden bg-white border-l-4 border-green-400 rounded-lg shadow-md p-6 my-12 hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="flex items-start gap-4 relative z-10">
          <Clock className="text-green-600 flex-shrink-0 mt-1" size={28} />
          <div className="space-y-2 text-left">
            <h4 className="text-xl font-semibold text-green-700">Temps économisé</h4>
            <p className="text-lg leading-relaxed text-gray-700">
              Création d'une illustration pédagogique en <strong className="text-green-800 text-xl">10 secondes</strong>, contre <span className="line-through text-gray-500">30 minutes à 1 heure</span> pour chercher ou créer une image adaptée.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
