import React from 'react';
import { Star, User } from 'lucide-react';
import { Card } from '../ui/card';

const testimonials = [
  {
    name: "Safia Douakh",
    role: "Maitresse de CM2",
    quote: "Avant, je passais des heures à corriger. Maintenant, Pédagoia me fait gagner du temps chaque jour. Je peux enfin me concentrer sur ce que je j'aime pour mes élèves.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&q=80",
  },
  {
    name: "Denis Vasseur",
    role: "Prof des écoles",
    quote: "Grâce à Pédagoia, j'ai pu créer des ressources adaptées aux besoins spécifiques de chacun de mes élèves. C'est un véritable game-changer pour la différenciation pédagogique !",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&q=80",
  },
  {
    name: "Ange Marthély",
    role: "Prof en 5ième et 6ième",
    quote: "Pédagoya m'a permis de moderniser mes méthodes d'enseignement. Mes élèves sont plus engagés et mes cours sont plus interactifs. C'est une vraie révolution dans mon quotidien.",
    useAvatar: true,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#E6F7F8]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-foreground">
          Ce que disent nos utilisateurs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="p-6 bg-white/90 backdrop-blur-sm shadow-premium hover:shadow-premium-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4 bg-secondary">
                  {testimonial.useAvatar ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                  ) : (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center">
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
