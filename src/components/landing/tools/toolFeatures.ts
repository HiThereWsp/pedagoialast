
import { Clock, Star, Lightbulb, Smile, PenTool } from "lucide-react";
import React from "react";

export interface ToolFeature {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string[];
}

export const toolFeatures: ToolFeature[] = [
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
    id: 'différenciation',
    title: 'Différenciation',
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
    icon: <PenTool className="h-6 w-6" />,
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
    icon: <Lightbulb className="h-6 w-6" />,
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
