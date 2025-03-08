
import { 
  Clock, 
  Star, 
  Lightbulb, 
  Smile, 
  PenTool, 
  LayoutList, 
  FileSpreadsheet, 
  SplitSquareVertical, 
  CheckCircle, 
  ImageIcon 
} from "lucide-react";
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
    icon: React.createElement(LayoutList, { className: "h-6 w-6" }),
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
    icon: React.createElement(FileSpreadsheet, { className: "h-6 w-6" }),
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
    icon: React.createElement(SplitSquareVertical, { className: "h-6 w-6" }),
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
    icon: React.createElement(CheckCircle, { className: "h-6 w-6" }),
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
    icon: React.createElement(ImageIcon, { className: "h-6 w-6" }),
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
    icon: React.createElement(PenTool, { className: "h-6 w-6" }),
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
    icon: React.createElement(Lightbulb, { className: "h-6 w-6" }),
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
