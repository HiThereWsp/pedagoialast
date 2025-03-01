
import React, { useState } from 'react';
import { Check, Clock } from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

export function ToolsSection() {
  const [activeTab, setActiveTab] = useState('evaluation');

  const features = [
    {
      id: 'sequences',
      title: 'Séquences',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      content: [
        "Créez des séquences pédagogiques complètes alignées avec mon programme",
        "Générez des progressions annuelles adaptées à vos classes",
        "Personnalisez les séquences selon les besoins spécifiques de vos élèves",
        "Accédez à votre bibliothèque de séquences sauvegardées",
        "Temps économisé : 4 heures par semaine",
        "Maux de tête : 0"
      ]
    },
    {
      id: 'exercices',
      title: 'Exercices',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      content: [
        "Générez des exercices variés pour toutes les matières et niveaux en un clic",
        "Créez des fiches d'exercices différenciés en quelques secondes",
        "Adaptez automatiquement la difficulté aux besoins de vos élèves",
        "Obtenez des exercices ludiques et engageants",
        "Temps économisé : 5 heures par semaine",
        "Maux de tête : 0"
      ]
    },
    {
      id: 'differenciation',
      title: 'Différentiation',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      content: [
        "Adaptez automatiquement le contenu aux différents niveaux de votre classe",
        "Générez des supports pour les élèves à besoins particuliers",
        "Créez des parcours d'apprentissage personnalisés",
        "Proposez des enrichissements pour les élèves plus avancés",
        "Obtenez des recommandations pour soutenir les élèves en difficulté",
        "Temps économisé : 7 heures par semaine",
        "Maux de tête : 0"
      ]
    },
    {
      id: 'evaluation',
      title: 'Évaluation',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      content: [
        "Création d'évaluations adaptées automatiquement au niveau des élèves",
        "Générez des modèles d'évaluations personnalisables par compétences",
        "Suggestions d'exercices pour évaluer des notions spécifiques",
        "Accédez à une banque croissante de questions par matière et niveau",
        "Adaptez vos évaluations en quelques clics selon les profils d'élèves",
        "Temps économisé : 6 heures par semaine",
        "Maux de tête : 0"
      ]
    },
    {
      id: 'images',
      title: 'Images',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      content: [
        "Générez des illustrations pédagogiques pertinentes pour vos cours",
        "Créez des supports visuels adaptés à l'âge de vos élèves",
        "Personnalisez les images selon vos besoins spécifiques",
        "Modifiez facilement les images générées selon vos préférences",
        "Temps économisé : 3 heures par semaine",
        "Maux de tête : 0"
      ]
    },
    {
      id: 'redaction',
      title: 'Rédaction',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      content: [
        "Rédigez facilement des messages clairs et professionnels aux parents d'élèves",
        "Générez des correspondances administratives en quelques clics",
        "Créez des comptes-rendus de réunion structurés et détaillés",
        "Assistance pour la rédaction de projets pédagogiques et demandes de financement",
        "Obtenez des modèles de communication adaptés à chaque situation",
        "Temps économisé : 4 heures par semaine",
        "Maux de tête : 0"
      ]
    },
    {
      id: 'nouveaux-outils',
      title: 'Réclamez vos outils',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9-9v18" />
        </svg>
      ),
      content: [
        "Proposez les fonctionnalités dont vous avez besoin",
        "Votez pour les prochains outils à développer en priorité",
        "Participez à la communauté d'enseignants pour partager vos idées",
        "Bénéficiez d'outils sur mesure adaptés à vos besoins spécifiques",
        "Recevez des mises à jour régulières avec de nouvelles fonctionnalités",
        "Temps économisé : illimité",
        "Plaisir d'enseigner : maximisé"
      ]
    }
  ];

  const activeFeature = features.find(feature => feature.id === activeTab);

  return (
    <section className="w-full">
      {/* Navigation des outils - Fond blanc */}
      <div className="bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-6 overflow-x-auto">
            <div className="flex space-x-8">
              {features.map((feature) => (
                <button 
                  key={feature.id}
                  className="flex flex-col items-center group" 
                  onClick={() => setActiveTab(feature.id)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${activeTab === feature.id ? 'bg-orange-500' : 'bg-transparent text-gray-400 group-hover:text-orange-500'}`}>
                    <div className={activeTab === feature.id ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}>
                      {feature.icon}
                    </div>
                  </div>
                  <span className={`text-sm ${activeTab === feature.id ? 'text-orange-500 font-medium' : 'text-gray-400 group-hover:text-orange-500'}`}>
                    {feature.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu de l'outil sélectionné - Fond avec AnimatedGridPattern */}
      <div className="relative py-12 bg-blue-50 overflow-hidden">
        <AnimatedGridPattern 
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className="[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">{activeFeature?.title}</h2>
            
            <ul className="space-y-6">
              {activeFeature?.content.map((item, index) => {
                const isMetric = index >= activeFeature.content.length - 2;
                return (
                  <li key={index} className={`flex items-start ${isMetric ? 'text-green-500 font-medium' : ''}`}>
                    <span className="mr-3 flex-shrink-0 mt-0.5">
                      {isMetric && index === activeFeature.content.length - 2 ? (
                        <Clock className="h-6 w-6 text-green-500" />
                      ) : isMetric ? (
                        <svg 
                          className="h-6 w-6 text-green-500"
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      ) : (
                        <Check className="h-6 w-6 text-green-500" />
                      )}
                    </span>
                    <span>{item}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
