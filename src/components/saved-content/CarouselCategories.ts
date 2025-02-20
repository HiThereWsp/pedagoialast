
export const carouselCategories = [
  {
    title: "Mes séquences pédagogiques",
    type: "lesson-plan" as const,
    displayType: "Séquence",
    emptyMessage: "Vous n'avez pas encore généré de séquence pédagogique. C'est le moment de laisser libre cours à votre créativité !",
    colorScheme: {
      color: '#FF9EBC',
      backgroundColor: '#FF9EBC20',
      borderColor: '#FF9EBC4D'
    }
  },
  {
    title: "Mes exercices",
    type: "exercise" as const,
    displayType: "Exercice",
    emptyMessage: "Aucun exercice n'a encore été créé. Commencez à générer des exercices adaptés à vos besoins !",
    colorScheme: {
      color: '#22C55E',
      backgroundColor: '#22C55E20',
      borderColor: '#22C55E4D'
    }
  },
  {
    title: "Mes images",
    type: "Image" as const,
    displayType: "Image",
    emptyMessage: "Votre galerie d'images est vide pour le moment. Générez votre première illustration pédagogique !",
    colorScheme: {
      color: '#F2FCE2',
      backgroundColor: '#F2FCE220',
      borderColor: '#F2FCE24D'
    }
  }
];
