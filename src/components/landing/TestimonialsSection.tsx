
import React from 'react';
import { Star, User } from 'lucide-react';
import { Card } from '../ui/card';

const testimonials = [
  {
    name: "Safia Douakh",
    role: "Maîtresse de CM2",
    quote: "Avant, je passais des heures à corriger. Maintenant, PédagoIA me fait gagner du temps chaque jour. Je peux enfin me concentrer sur ce que j'aime pour mes élèves.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&q=80",
  },
  {
    name: "Denis Vasseur",
    role: "Prof des écoles",
    quote: "Grâce à PédagoIA, j'ai pu créer des ressources adaptées aux besoins spécifiques de chacun de mes élèves. C'est un véritable game-changer pour la différenciation pédagogique !",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&q=80",
  },
  {
    name: "Ange Marthély",
    role: "Prof en 5ième et 6ième",
    quote: "PédagoIA m'a permis de moderniser mes méthodes d'enseignement. Mes élèves sont plus engagés et mes cours sont plus interactifs. C'est une vraie révolution dans mon quotidien.",
    useAvatar: true,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-blue-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Ce que disent nos utilisateurs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="p-8 bg-white shadow-premium hover:shadow-premium-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 bg-secondary">
                  {testimonial.useAvatar ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-12 w-12 text-primary" />
                    </div>
                  ) : (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="text-center">
                  <div className="font-bold text-xl">{testimonial.name}</div>
                  <div className="text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground text-center mb-6">"{testimonial.quote}"</p>
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-primary fill-current" />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
