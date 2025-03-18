import React from 'react';
import { Clock, Settings, FileText, Download, ArrowRight } from 'lucide-react';
export function SequenceGeneratorSection() {
  return <section id="generateur-sequences" className="space-y-8">
      <h2 className="text-3xl font-bold text-[#2c3e50] border-b border-gray-100 pb-4">
        Créateur de séquences pédagogiques
      </h2>
      
      <div className="bg-gray-50 rounded-xl p-6 text-center my-12 shadow-inner">
        <p className="text-gray-500">[Vidéo/GIF montrant la création d'une séquence]</p>
      </div>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-8">
        Le créateur de séquences pédagogiques de PedagoIA vous permet de générer une séquence complète en quelques minutes. Vous obtenez immédiatement :
      </p>
      
      <ol className="list-none space-y-6 mb-12 pl-0">
        <li className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-purple-400 flex items-center">
          <div className="bg-purple-100 p-4 rounded-full mr-6">
            <Settings className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-[#3d4852]">1. Configurez votre séquence</h3>
            <p className="text-gray-700">Choisissez la matière, le niveau et les objectifs pédagogiques de votre séquence</p>
          </div>
          <div className="ml-4 text-purple-600">
            <ArrowRight className="animate-pulse" />
          </div>
        </li>
        
        <li className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-purple-400 flex items-center">
          <div className="bg-purple-100 p-4 rounded-full mr-6">
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-[#3d4852]">2. Générez votre contenu</h3>
            <p className="text-gray-700">Notre IA crée une séquence complète avec progression, objectifs, recommandations et supports de cours</p>
          </div>
          <div className="ml-4 text-purple-600">
            <ArrowRight className="animate-pulse" />
          </div>
        </li>
        
        <li className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-purple-400 flex items-center">
          <div className="bg-purple-100 p-4 rounded-full mr-6">
            <Download className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-[#3d4852]">3. Téléchargez et adaptez</h3>
            <p className="text-gray-700">Exportez votre séquence complète dans votre logiciel de traitement de texte favori</p>
          </div>
        </li>
      </ol>
      
      <div className="relative overflow-hidden bg-white border-l-4 border-green-400 rounded-lg shadow-md p-6 my-12 hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="flex items-start gap-4 relative z-10">
          <Clock className="text-green-600 flex-shrink-0 mt-1" size={28} />
          <div className="space-y-2 text-left">
            <h4 className="text-xl font-semibold text-green-700">Temps économisé</h4>
            <p className="text-lg leading-relaxed text-gray-700">
              Création d'une séquence complète en <strong className="text-green-800 text-xl">15 minutes</strong>, contre <span className="line-through text-gray-500">3 à 4 heures</span> habituellement.
            </p>
          </div>
        </div>
      </div>
    </section>;
}