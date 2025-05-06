import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

// FAQ réorganisée et simplifiée
const faqs = [
  // Nouvelle question en première position
  {
    question: "Pourquoi PedagoIA alors que j'ai déjà ChatGPT ?",
    answer: (
      <p className="text-left">
        PedagoIA est un outil conçu pour les enseignants français, intégrant des IA spécialisées et adaptées aux besoins pédagogiques concrets. Contrairement à ChatGPT, une IA généraliste, PedagoIA évolue en continu grâce aux retours directs des enseignants.
      </p>
    )
  },
  
  // Question sur le prix
  {
    question: "Combien ça coûte ?",
    answer: (
      <p className="text-left">
        PedagoIA, c'est à partir de 9,90€/mois (engagement annuel) ou 11,90€/mois sans engagement.
        Tu choisis ce qui te convient.
      </p>
    )
  },
  
  // Question sur l'essai
  {
    question: "Je peux essayer avant de m'abonner ?",
    answer: (
      <p className="text-left">
        Bien sûr ! Tu as 3 jours d'essai gratuit pour tout tester sans limite.
        <br />
        👉 <Link to="/login" className="text-primary hover:underline">Clique ici pour découvrir la plateforme</Link>.
      </p>
    )
  },
  
  // Question sur la formation
  {
    question: "Faut-il se former pour utiliser PedagoIA ?",
    answer: (
      <p className="text-left">
        Pas du tout. Tout est pensé pour être ultra simple à prendre en main, même si tu n'as aucune compétence technique.
      </p>
    )
  },
  
  // Question sur les résultats concrets
  {
    question: "Et concrètement, ça change quoi ?",
    answer: (
      <p className="text-left">
        Nos utilisateurs gagnent en moyenne 4 à 6 heures par semaine sur la préparation.
        <br />
        Résultat : plus de temps pour les élèves, des contenus plus personnalisés et moins de charge mentale.
      </p>
    )
  }
];

export function FAQSection() {
  return (
    <section className="py-20 bg-white border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Foire aux questions
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white shadow-sm rounded-lg border-0 overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-4 text-xl font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {/* Note supplémentaire */}
          <p className="text-center text-muted-foreground mt-8">
            Vous ne trouvez pas votre réponse ? 
            <Link to="/contact" className="text-primary ml-1 hover:underline">
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
