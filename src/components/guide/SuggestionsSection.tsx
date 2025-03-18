
import React from 'react';
import { Clock, Lightbulb, ArrowUp, Star } from 'lucide-react';

export function SuggestionsSection() {
  return (
    <section id="suggestions" className="space-y-8">
      <h2 className="text-3xl font-bold text-slate-800 border-b border-gray-100 pb-4">
        Contribuez à l'évolution de PedagoIA
      </h2>
      
      <div className="bg-gray-50 rounded-xl p-6 text-center my-12 shadow-sm">
        <p className="text-gray-500">[Vidéo/GIF montrant le processus de suggestion et vote]</p>
      </div>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-8">
        PedagoIA évolue constamment selon vos besoins. Grâce à notre système de suggestions, vous avez un impact direct sur le développement de nouveaux outils et fonctionnalités.
      </p>
      
      <ol className="list-none space-y-6 mb-12 pl-0">
        <li className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-purple-400 flex items-center">
          <div className="bg-purple-100 p-4 rounded-full mr-6">
            <Lightbulb className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Proposez de nouvelles fonctionnalités</h3>
            <p className="text-gray-700">Partagez vos idées pour améliorer PedagoIA et répondre à vos besoins spécifiques</p>
          </div>
        </li>
        
        <li className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-purple-400 flex items-center">
          <div className="bg-purple-100 p-4 rounded-full mr-6">
            <ArrowUp className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Votez pour les idées de la communauté</h3>
            <p className="text-gray-700">Soutenez les fonctionnalités qui vous semblent les plus utiles pour prioriser leur développement</p>
          </div>
        </li>
        
        <li className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-purple-400 flex items-center">
          <div className="bg-purple-100 p-4 rounded-full mr-6">
            <Star className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Obtenez des mises à jour prioritaires</h3>
            <p className="text-gray-700">Les fonctionnalités les plus populaires sont développées en priorité et vous êtes informés dès leur disponibilité</p>
          </div>
        </li>
      </ol>
      
      <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-400 my-8">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">Déjà implémenté grâce à vos votes</h4>
        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <div className="bg-green-100 p-1 rounded-full">
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-gray-700">Générateur d'images pédagogiques</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="bg-green-100 p-1 rounded-full">
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-gray-700">Création d'exercices à partir d'une séquence</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="bg-green-100 p-1 rounded-full">
              <Star className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-gray-700">Espace de sauvegarde pour toutes les ressources générées</span>
          </li>
        </ul>
      </div>
      
      <div className="relative overflow-hidden bg-white border-l-4 border-green-400 rounded-lg shadow-md p-6 my-12 hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="flex items-start gap-4 relative z-10">
          <Clock className="text-green-600 flex-shrink-0 mt-1" size={28} />
          <div className="space-y-2 text-left">
            <h4 className="text-xl font-semibold text-green-700">Une plateforme qui vous ressemble</h4>
            <p className="text-lg leading-relaxed text-gray-700">
              Participez activement à l'évolution de l'outil pour qu'il réponde parfaitement à vos besoins quotidiens.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
