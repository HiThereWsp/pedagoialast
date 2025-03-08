
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

const faqs = [
  {
    question: "Comment PedagoIA s'intègre-t-il à mes outils existants ?",
    answer: "pedagoIA est conçu pour fonctionner en complément de vos outils actuels. Les ressources pédagogiques générées sont importables dans vos outils de traitement de texte habituels."
  },
  {
    question: "Est-il conforme aux programmes de l'Éducation Nationale ?",
    answer: "Les outils sont conçus pour répondre au mieux aux exigences de l'éducation nationale. Cependant, il est toujours recommandé de vérifier les contenus générés par l'IA."
  },
  {
    question: "Ai-je besoin de compétences techniques pour utiliser PedagoIA ?",
    answer: "Non, PedagoIA est conçu pour être intuitif et facile à utiliser. Notre interface simple ne nécessite aucune compétence technique particulière. Si vous savez utiliser un navigateur web, vous pouvez utiliser PedagoIA."
  },
  {
    question: "Quelle est la politique de confidentialité concernant les données des élèves ?",
    answer: "La protection des données est notre priorité. Nous respectons strictement le RGPD et n'utilisons les données que de manière anonymisée pour améliorer nos services. Aucune donnée personnelle d'élève n'est jamais partagée avec des tiers."
  },
  {
    question: "Puis-je essayer PedagoIA avant de m'engager ?",
    answer: "Oui, nous proposons une période d'essai gratuite qui vous permet d'explorer toutes les fonctionnalités de la plateforme. Aucune carte bancaire n'est requise pour commencer."
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
        </div>
      </div>
    </section>
  );
}
