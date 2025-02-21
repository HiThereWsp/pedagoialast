
import { type SavedContent } from "@/types/saved-content"

export const exerciseCategories = {
  standard: {
    label: 'Standard',
    color: '#22C55E',
    backgroundColor: '#22C55E20',
    borderColor: '#22C55E4D'
  },
  differentiated: {
    label: 'Différencié',
    color: '#9333EA',
    backgroundColor: '#9333EA20',
    borderColor: '#9333EA4D'
  }
} as const;

export const carouselCategories = [
  {
    type: 'lesson-plan' as const,
    title: 'Mes séquences',
    displayType: 'Séquence',
    emptyMessage: "Vous n'avez pas encore créé de séquence.",
    colorScheme: {
      color: '#FF9EBC',
      backgroundColor: '#FF9EBC20',
      borderColor: '#FF9EBC4D'
    }
  },
  {
    type: 'exercise' as const,
    title: 'Mes exercices',
    displayType: 'Exercice',
    emptyMessage: "Vous n'avez pas encore créé d'exercice.",
    colorScheme: {
      color: '#22C55E',
      backgroundColor: '#22C55E20',
      borderColor: '#22C55E4D'
    }
  },
  {
    type: 'Image' as const,
    title: 'Mes images',
    displayType: 'Image',
    emptyMessage: "Vous n'avez pas encore généré d'image.",
    colorScheme: {
      color: '#F2FCE2',
      backgroundColor: '#F2FCE220',
      borderColor: '#F2FCE24D'
    }
  },
  {
    type: 'correspondence' as const,
    title: 'Mes correspondances',
    displayType: 'Correspondance',
    emptyMessage: "Vous n'avez pas encore créé de correspondance.",
    colorScheme: {
      color: '#9b87f5',
      backgroundColor: '#9b87f520',
      borderColor: '#9b87f54D'
    }
  }
] as const;

export type CarouselCategory = typeof carouselCategories[number];
