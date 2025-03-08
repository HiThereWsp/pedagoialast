
import React from 'react';
import { UserPlus, FileText, Sparkles } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: "Je m'inscris",
    description: "En bénéficiant d'un essai gratuit de 3 jours avec garantie satisfait ou remboursé, sans engagement.",
    icon: UserPlus
  },
  {
    number: 2,
    title: "Je génère mes contenus",
    description: "En quelques clics, je crée des ressources pédagogiques adaptées à mes besoins et je peux voter pour de nouvelles fonctionnalités.",
    icon: FileText
  },
  {
    number: 3,
    title: "J'améliore mon quotidien",
    description: "Je profite chaque mois de nouveaux outils pour gagner du temps, avec sauvegarde automatique de tous mes contenus.",
    icon: Sparkles
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4 leading-tight tracking-tight text-balance">Comment ça marche ?</h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Trois étapes simples pour être prêt à révolutionner votre enseignement
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.number}
                  className="bg-white p-8 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-300 transform hover:-translate-y-2 relative"
                >
                  <div className="w-12 h-12 bg-foreground rounded-lg flex items-center justify-center text-white font-bold text-2xl absolute -top-6 -left-2 rotate-3">
                    {step.number}
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 mt-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
