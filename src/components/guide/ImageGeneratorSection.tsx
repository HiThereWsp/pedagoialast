
import React from 'react';
import { Clock } from 'lucide-react';

export function ImageGeneratorSection() {
  return (
    <section id="generateur-images" className="space-y-20">
      <h2 className="text-3xl font-bold text-slate-800 border-b border-gray-100 pb-4">
        Générateur d'images pédagogiques
      </h2>
      
      <div className="bg-gray-50 rounded-xl p-8 text-center my-16 shadow-inner">
        <p className="text-gray-500">[Vidéo/GIF montrant la génération d'images]</p>
      </div>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-12">
        Les supports visuels améliorent considérablement l'engagement des élèves. PedagoIA intègre un <strong className="text-slate-800">générateur d'images pédagogiques</strong> pour illustrer vos cours sans effort.
      </p>
      
      <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 my-16">
        <div className="flex items-start gap-6">
          <div className="bg-green-100 p-4 rounded-full shadow-sm">
            <Clock className="text-green-600 flex-shrink-0" size={32} />
          </div>
          <div className="space-y-3">
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
