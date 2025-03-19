
import React from 'react';
import { Clock, ImageIcon, Paintbrush, Palette } from 'lucide-react';

export function ImageGeneratorSection() {
  return (
    <section id="generateur-images" className="space-y-16">
      <h2 className="text-3xl font-bold text-slate-800 border-b border-gray-100 pb-4">
        Générateur d'images pédagogiques
      </h2>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-12">
        Les supports visuels améliorent considérablement l'engagement des élèves. PedagoIA intègre un <strong className="text-slate-800">générateur d'images pédagogiques</strong> pour illustrer vos cours sans effort.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-16">
        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
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
        
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start gap-6">
            <div className="bg-purple-100 p-4 rounded-full shadow-sm">
              <ImageIcon className="text-purple-600 flex-shrink-0" size={32} />
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-purple-700">Illustrations personnalisées</h4>
              <p className="text-lg leading-relaxed text-gray-700">
                Générez des images parfaitement adaptées à vos besoins pédagogiques spécifiques, avec différents styles artistiques disponibles.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start gap-6">
            <div className="bg-blue-100 p-4 rounded-full shadow-sm">
              <Palette className="text-blue-600 flex-shrink-0" size={32} />
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-blue-700">Styles variés</h4>
              <p className="text-lg leading-relaxed text-gray-700">
                Choisissez parmi plusieurs styles visuels : photo réaliste, dessin, aquarelle, illustration vectorielle, et bien plus encore.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-start gap-6">
            <div className="bg-amber-100 p-4 rounded-full shadow-sm">
              <Paintbrush className="text-amber-600 flex-shrink-0" size={32} />
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-semibold text-amber-700">Aide à la conception</h4>
              <p className="text-lg leading-relaxed text-gray-700">
                L'assistant vous aide à formuler vos demandes pour obtenir exactement l'image dont vous avez besoin pour votre cours.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-100 my-16">
        <h4 className="text-lg font-medium text-gray-800 mb-4">Comment ça marche ?</h4>
        <ol className="list-decimal pl-5 space-y-3 text-gray-700">
          <li>Décrivez l'image dont vous avez besoin en français simple</li>
          <li>Choisissez un style visuel adapté à votre public</li>
          <li>Générez l'image en un clic</li>
          <li>Téléchargez et intégrez-la directement dans vos supports de cours</li>
        </ol>
      </div>
    </section>
  );
}
