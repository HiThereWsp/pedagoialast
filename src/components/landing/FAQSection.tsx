import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

const faqs = [
  {
    question: "Comment Pédagoia s'intègre-t-il à mes outils existants ?",
    answer: "Pédagoia est conçu pour fonctionner en complément de vos outils actuels. Notre plateforme s'adapte à votre flux de travail existant et peut être utilisée parallèlement à vos autres ressources pédagogiques."
  },
  {
    question: "Est-il conforme aux programmes de l'Éducation Nationale ?",
    answer: "Oui, absolument. Tous nos outils sont développés en conformité avec les programmes officiels de l'Éducation Nationale et sont régulièrement mis à jour pour refléter les changements curriculaires."
  },
  {
    question: "Ai-je besoin de compétences techniques pour utiliser Pédagoia ?",
    answer: "Non, Pédagoia est conçu pour être intuitif et facile à utiliser. Notre interface simple ne nécessite aucune compétence technique particulière. Si vous savez utiliser un navigateur web, vous pouvez utiliser Pédagoia."
  },
  {
    question: "Quelle est la politique de confidentialité concernant les données des élèves ?",
    answer: "La protection des données est notre priorité. Nous respectons strictement le RGPD et n'utilisons les données que de manière anonymisée pour améliorer nos services. Aucune donnée personnelle d'élève n'est jamais partagée avec des tiers."
  },
  {
    question: "Puis-je essayer Pédagoia avant de m'engager ?",
    answer: "Oui, nous proposons une période d'essai gratuite qui vous permet d'explorer toutes les fonctionnalités de la plateforme. Aucune carte bancaire n'est requise pour commencer."
  }
];

export function FAQSection() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Foire aux questions
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-200"
              >
                <AccordionTrigger className="px-6 text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-muted-foreground">
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
