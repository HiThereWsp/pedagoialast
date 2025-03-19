
import React from 'react';
import { Clock, Settings, FileText, Download, ArrowRight } from 'lucide-react';

export function SequenceGeneratorSection() {
  return (
    <section id="generateur-sequences" className="space-y-16">
      <h2 className="text-3xl font-bold text-slate-800 border-b border-gray-100 pb-4">
        Créateur de séquences pédagogiques
      </h2>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-12">
        Le créateur de séquences pédagogiques de PedagoIA vous permet de générer une séquence complète en quelques minutes. Vous obtenez immédiatement :
      </p>
      
      <ol className="list-none space-y-12 mb-16 pl-0">
        <li className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="bg-purple-100 p-4 rounded-full mr-6 shadow-sm">
              <Settings className="h-10 w-10 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Configurez votre séquence</h3>
              </div>
              <p className="text-gray-700 mt-2">Choisissez la matière, le niveau et les objectifs pédagogiques de votre séquence</p>
            </div>
            <div className="ml-4 text-purple-600">
              <ArrowRight className="animate-pulse" size={24} />
            </div>
          </div>
        </li>
        
        <li className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="bg-purple-100 p-4 rounded-full mr-6 shadow-sm">
              <FileText className="h-10 w-10 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Générez votre contenu</h3>
              </div>
              <p className="text-gray-700 mt-2">Notre IA crée une séquence complète avec progression, objectifs, recommandations et supports de cours</p>
            </div>
            <div className="ml-4 text-purple-600">
              <ArrowRight className="animate-pulse" size={24} />
            </div>
          </div>
        </li>
        
        <li className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="bg-purple-100 p-4 rounded-full mr-6 shadow-sm">
              <Download className="h-10 w-10 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Téléchargez et adaptez</h3>
              </div>
              <p className="text-gray-700 mt-2">Exportez votre séquence complète dans votre logiciel de traitement de texte favori</p>
            </div>
          </div>
        </li>
      </ol>
      
      <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 my-16">
        <div className="flex items-start gap-6">
          <div className="bg-green-100 p-4 rounded-full shadow-sm">
            <Clock className="text-green-600 flex-shrink-0" size={32} />
          </div>
          <div className="space-y-3">
            <h4 className="text-xl font-semibold text-green-700">Temps économisé</h4>
            <p className="text-lg leading-relaxed text-gray-700">
              Création d'une séquence complète en <strong className="text-green-800 text-xl">5 minutes</strong>, contre <span className="line-through text-gray-500">3 à 4 heures</span> habituellement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
