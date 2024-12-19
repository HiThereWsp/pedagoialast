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
    <section className="py-24 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto">
              3 étapes simples vers un enseignement plus serein et efficace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Ligne de connexion entre les étapes */}
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 -translate-y-1/2 z-0" />

            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="relative group"
              >
                <div className="relative p-8 bg-white rounded-2xl shadow-premium hover:shadow-premium-lg transition-all duration-300 transform hover:-translate-y-2 z-10">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl flex items-center justify-center font-bold text-lg transform rotate-3 group-hover:rotate-6 transition-transform">
                    {step.number}
                  </div>
                  <div className="mb-6 p-4 bg-primary/5 rounded-xl w-fit mx-auto group-hover:bg-primary/10 transition-colors">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-center group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}