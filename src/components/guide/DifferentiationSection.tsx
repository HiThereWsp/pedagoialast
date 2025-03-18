
import React from 'react';
import { Clock, FileText, User, ArrowRight } from 'lucide-react';
export function DifferentiationSection() {
  return (
    <section id="differentiation" className="space-y-20">
      <h2 className="text-3xl font-bold text-slate-800 border-b border-gray-100 pb-4">
        Faire votre différenciation pédagogique
      </h2>
      
      <div className="bg-gray-50 rounded-xl p-8 text-center my-16 shadow-inner">
        <p className="text-gray-500">[Vidéo/GIF montrant le processus de différenciation]</p>
      </div>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-12">
        La différenciation pédagogique est essentielle pour répondre aux besoins individuels des élèves, mais elle nécessite traditionnellement un temps considérable. Avec PedagoIA, adaptez vos exercices en quelques clics :
      </p>
      
      <ol className="list-none space-y-12 mb-16 pl-0">
        <li className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="bg-purple-100 p-4 rounded-full mr-6 shadow-sm">
              <FileText className="h-10 w-10 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Importez un exercice existant</h3>
              </div>
              <p className="text-gray-700 mt-2">Utilisez un exercice créé avec PedagoIA ou copiez simplement votre exercice</p>
            </div>
            <div className="ml-4 text-purple-600">
              <ArrowRight className="animate-pulse" size={24} />
            </div>
          </div>
        </li>
        
        <li className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="bg-purple-100 p-4 rounded-full mr-6 shadow-sm">
              <User className="h-10 w-10 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Renseignez les spécificités de l'élève</h3>
              </div>
              <p className="text-gray-700 mt-2">Décrivez les besoins particuliers, les difficultés et des précisions de contexte</p>
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
                <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Copiez votre exercice généré</h3>
              </div>
              <p className="text-gray-700 mt-2">Récupérez l'exercice parfaitement adapté aux besoins spécifiques de l'élève</p>
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
              Adaptation d'un exercice en <strong className="text-green-800 text-xl">3 minutes</strong>, contre <span className="line-through text-gray-500">2 heures</span> habituellement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
