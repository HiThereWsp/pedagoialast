
import React from 'react';
import { UserPlus, CreditCard, FileText, ArrowRight, Clock } from 'lucide-react';

export function FirstStepsSection() {
  return (
    <section id="premiers-pas" className="space-y-20">
      <h2 className="text-3xl font-bold text-slate-800 border-b border-gray-100 pb-4">
        Premiers pas avec PedagoIA
      </h2>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-12">Démarrer avec PedagoIA est simple et rapide. Suivez ces 3 étapes :</p>
      
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <li className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4 shadow-sm">
            <UserPlus className="h-10 w-10 text-purple-600" />
          </div>
          <div className="flex items-center mb-3">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
            <h3 className="text-xl font-semibold text-gray-800">Créez un compte</h3>
          </div>
          <p className="text-gray-700">Inscrivez-vous gratuitement en quelques secondes avec votre email professionnel ou personnel</p>
          <div className="mt-6 text-purple-600 flex items-center justify-center">
            <ArrowRight className="animate-pulse" size={24} />
          </div>
        </li>
        
        <li className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4 shadow-sm">
            <CreditCard className="h-10 w-10 text-purple-600" />
          </div>
          <div className="flex items-center mb-3">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
            <h3 className="text-xl font-semibold text-gray-800">Choisissez votre plan</h3>
          </div>
          <p className="text-gray-700">Sélectionnez le forfait qui vous convient <strong className="text-purple-700">avec un essai gratuit</strong> sans engagement</p>
          <div className="mt-6 text-purple-600 flex items-center justify-center">
            <ArrowRight className="animate-pulse" size={24} />
          </div>
        </li>
        
        <li className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4 shadow-sm">
            <FileText className="h-10 w-10 text-purple-600" />
          </div>
          <div className="flex items-center mb-3">
            <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-2">3</span>
            <h3 className="text-xl font-semibold text-gray-800">Générez vos cours</h3>
          </div>
          <p className="text-gray-700">Accédez immédiatement à tous les outils et commencez à créer vos ressources pédagogiques</p>
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
              L'inscription ne prend que <strong className="text-green-800 text-xl">2 minutes</strong> et vous donne immédiatement accès à tous les outils qui vous feront gagner des heures de travail chaque semaine.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
