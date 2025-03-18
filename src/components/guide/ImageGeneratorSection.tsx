
import React from 'react';

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
      
      <div className="pl-8 border-l-4 border-green-300 py-6 my-12">
        <h4 className="text-xl font-semibold text-green-800 mb-3">Temps économisé</h4>
        <p className="text-lg leading-relaxed text-green-700">
          Création d'une illustration pédagogique en 10 secondes, contre 30 minutes à 1 heure pour chercher ou créer une image adaptée.
        </p>
      </div>
    </section>
  );
}
