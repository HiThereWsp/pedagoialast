import React from 'react';
import { UserPlus, Wand2, Smile } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: "Inscrivez-vous gratuitement",
    description: "Créez votre compte en quelques secondes et accédez immédiatement à nos outils."
  },
  {
    number: 2,
    icon: Wand2,
    title: "Choisissez vos outils",
    description: "Sélectionnez et utilisez chaque jour l'outil adapté à votre besoin du moment. De la préparation à l'évaluation."
  },
  {
    number: 3,
    icon: Smile,
    title: "Retrouvez votre équilibre",
    description: "Redécouvrez le plaisir d'enseigner en vous concentrant sur ce qui compte vraiment : l'épanouissement et la réussite de vos élèves sans négliger votre santé mentale."
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Comment ça marche ?
            <span className="block text-xl text-muted-foreground mt-2">
              3 étapes vers un enseignement plus serein
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div 
                key={step.number}
                className="relative p-6 bg-white rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-200"
              >
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  {step.number}
                </div>
                <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
