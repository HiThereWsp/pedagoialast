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
  // Question la plus populaire (score 4)
  {
    question: "Puis-je essayer PedagoIA avant de m'engager ?",
    answer: (
      <p className="text-left">
        Oui, nous proposons une période d'essai gratuite de 3 jours qui vous permet d'explorer toutes les fonctionnalités de la plateforme. <Link to="/login" className="text-primary hover:underline">Je souhaite commencer mon essai gratuit</Link>.
      </p>
    )
  },
  
  // Question sur le prix (nouvelle)
  {
    question: "Quels sont les tarifs de PedagoIA ?",
    answer: (
      <div className="text-left">
        <p>PedagoIA est accessible à partir de 9,90€ par mois. Notre formule mensuelle sans engagement est proposée à 11,90€ par mois.</p>
        <p className="mt-2">Pour les établissements scolaires, nous proposons des tarifs dégressifs adaptés au nombre d'enseignants. Tous nos abonnements donnent accès à l'ensemble des fonctionnalités sans restriction.</p>
        <p className="mt-2">Pour en savoir plus sur nos offres, <Link to="/pricing" className="text-primary hover:underline">consultez notre page de tarification</Link>.</p>
      </div>
    )
  },
  
  // Question sur l'intégration, reformulée et plus concise
  {
    question: "Comment intégrer PedagoIA dans mon quotidien d'enseignant ?",
    answer: (
      <div className="text-left">
        <p>PedagoIA s'adapte à votre flux de travail existant, sans nécessiter de compétences techniques particulières. Notre interface intuitive vous permet de créer des ressources pédagogiques en quelques clics, de les exporter dans vos formats habituels et de gagner un temps précieux sur vos préparations.</p>
        <div className="mt-3 flex items-center text-primary">
        </div>
      </div>
    )
  },
  
  // Question repositionnée sur le temps gagné, simplifiée
  {
    question: "Quels résultats puis-je attendre avec PedagoIA ?",
    answer: (
      <p className="text-left">
        Selon nos utilisateurs actuels, PedagoIA permet de gagner en moyenne 4 à 6 heures par semaine sur la préparation des cours et des exercices. Vous pourrez personnaliser davantage les ressources pour vos élèves et diversifier vos approches pédagogiques, le tout en réduisant considérablement votre charge de travail.
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
