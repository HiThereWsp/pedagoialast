
import React from 'react';
import { UserPlus, CreditCard, FileText, ArrowRight, Clock } from 'lucide-react';

export function FirstStepsSection() {
  return (
    <section id="premiers-pas" className="space-y-8">
      <h2 className="text-3xl font-bold text-[#2c3e50] border-b border-gray-100 pb-4">
        Premiers pas avec PedagoIA
      </h2>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-8">Démarrer avec PedagoIA est simple et rapide. Suivez ces 3 étapes :</p>
      
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <li className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-purple-400 flex flex-col items-center text-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <UserPlus className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-[#3d4852]">1. Créez un compte</h3>
          <p className="text-gray-700">Inscrivez-vous gratuitement en quelques secondes avec votre email professionnel ou personnel</p>
          <div className="mt-4 text-purple-600 flex items-center justify-center">
            <ArrowRight className="animate-pulse" />
          </div>
        </li>
        
        <li className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-purple-400 flex flex-col items-center text-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <CreditCard className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-[#3d4852]">2. Choisissez votre plan</h3>
          <p className="text-gray-700">Sélectionnez le forfait qui vous convient <strong className="text-purple-700">avec un essai gratuit</strong> sans engagement</p>
          <div className="mt-4 text-purple-600 flex items-center justify-center">
            <ArrowRight className="animate-pulse" />
          </div>
        </li>
        
        <li className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-purple-400 flex flex-col items-center text-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-[#3d4852]">3. Générez vos cours</h3>
          <p className="text-gray-700">Accédez immédiatement à tous les outils et commencez à créer vos ressources pédagogiques</p>
        </li>
      </ol>
      
      <div className="relative overflow-hidden bg-white border-l-4 border-green-400 rounded-lg shadow-md p-6 my-12 hover:-translate-y-1 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
        <div className="flex items-start gap-4 relative z-10">
          <Clock className="text-green-600 flex-shrink-0 mt-1" size={28} />
          <div className="space-y-2 text-left">
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
