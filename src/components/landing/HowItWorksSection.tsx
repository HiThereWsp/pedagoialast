
import React from 'react';

const steps = [
  {
    number: 1,
    title: "Je m'inscris",
    description: "En bénéficiant d'un essai totalement gratuit et je peux changer à tout moment."
  },
  {
    number: 2,
    title: "Je génère mes contenus",
    description: "En sauvegardant le tout automatiquement et peux voter pour de nouvelles fonctionnalités."
  },
  {
    number: 3,
    title: "J'améliore mon quotidien",
    description: "Je profite chaque mois de nouveaux outils pour gagner du temps."
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Comment ça marche ?</h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Trois étapes simples pour être prêt à révolutionner votre enseignement
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="bg-white p-8 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-300 transform hover:-translate-y-2 relative"
              >
                <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center text-white font-bold text-2xl absolute -top-6 -left-2 rotate-3">
                  {step.number}
                </div>
                <div className="w-16 h-16 bg-secondary/20 rounded-lg flex items-center justify-center mb-6 mt-4"></div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
