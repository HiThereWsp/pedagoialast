
import React from 'react';
import { Clock } from 'lucide-react';

export function FirstStepsSection() {
  return (
    <section id="premiers-pas" className="space-y-8">
      <h2 className="text-3xl font-bold text-[#2c3e50] border-b border-gray-100 pb-4">
        Premiers pas avec PedagoIA
      </h2>
      
      <h3 className="text-2xl font-semibold mt-12 mb-6 text-[#3d4852]">Création de votre compte enseignant</h3>
      
      <div className="bg-gray-50 rounded-xl p-6 text-center my-12 shadow-inner">
        <p className="text-gray-500">[Vidéo/GIF montrant le processus d'inscription]</p>
      </div>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-8">PedagoIA est spécialement conçu pour les enseignants francophone, de la maternelle au lycée. Pour commencer :</p>
      
      <ol className="list-none space-y-6 mb-12 pl-0">
        <li className="flex items-start">
          <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">1</span>
          <span className="text-lg">Rendez-vous sur <a href="https://pedagoia.fr" className="text-blue-600 hover:underline font-medium">PedagoIA.fr</a></span>
        </li>
        <li className="flex items-start">
          <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">2</span>
          <span className="text-lg">Cliquez sur "S'inscrire" en haut à droite</span>
        </li>
        <li className="flex items-start">
          <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">3</span>
          <span className="text-lg">Renseignez votre adresse email professionnelle ou personnelle</span>
        </li>
        <li className="flex items-start">
          <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">4</span>
          <span className="text-lg">Créez un mot de passe sécurisé</span>
        </li>
        <li className="flex items-start">
          <span className="flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded-full w-8 h-8 mr-4 flex-shrink-0">5</span>
          <span className="text-lg">Complétez votre profil en indiquant votre prénom, niveau d'enseignement et matières</span>
        </li>
      </ol>
      
      <p className="text-lg leading-relaxed text-gray-700 mb-8">Une fois inscrit, vous accédez au tableau de bord personnalisé où tous vos outils sont accessibles en un clic.</p>
      
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
