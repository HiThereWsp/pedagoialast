
import React from 'react';
import { Check } from 'lucide-react';

export function TableOfContents() {
  return (
    <section className="my-16 space-y-8">
      <h2 className="text-3xl font-bold text-[#2c3e50] border-b border-gray-100 pb-4">Sommaire</h2>
      <nav aria-label="Table des matières">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <li className="flex items-center">
            <div className="mr-3 text-purple-500"><Check size={18} /></div>
            <a href="#premiers-pas" className="text-blue-600 hover:underline text-lg">Premiers pas avec PedagoIA</a>
          </li>
          <li className="flex items-center">
            <div className="mr-3 text-purple-500"><Check size={18} /></div>
            <a href="#generateur-sequences" className="text-blue-600 hover:underline text-lg">Générateur de séquences pédagogiques</a>
          </li>
          <li className="flex items-center">
            <div className="mr-3 text-purple-500"><Check size={18} /></div>
            <a href="#exercices-evaluations" className="text-blue-600 hover:underline text-lg">Créer des exercices et des évaluations</a>
          </li>
          <li className="flex items-center">
            <div className="mr-3 text-purple-500"><Check size={18} /></div>
            <a href="#generateur-images" className="text-blue-600 hover:underline text-lg">Générateur d'images pédagogiques</a>
          </li>
          <li className="flex items-center">
            <div className="mr-3 text-purple-500"><Check size={18} /></div>
            <a href="#correspondances" className="text-blue-600 hover:underline text-lg">Correspondances et communications</a>
          </li>
          <li className="flex items-center">
            <div className="mr-3 text-purple-500"><Check size={18} /></div>
            <a href="#gestion-ressources" className="text-blue-600 hover:underline text-lg">Gestion de vos ressources</a>
          </li>
          <li className="flex items-center">
            <div className="mr-3 text-purple-500"><Check size={18} /></div>
            <a href="#astuces" className="text-blue-600 hover:underline text-lg">Astuces pour optimiser votre utilisation</a>
          </li>
          <li className="flex items-center">
            <div className="mr-3 text-purple-500"><Check size={18} /></div>
            <a href="#faq" className="text-blue-600 hover:underline text-lg">FAQ : Réponses à vos questions</a>
          </li>
        </ul>
      </nav>
    </section>
  );
}
