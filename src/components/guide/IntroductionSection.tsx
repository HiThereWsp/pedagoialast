
import React from 'react';

export function IntroductionSection() {
  return (
    <section id="introduction" className="space-y-8" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Guide Complet PedagoIA : L'Assistant IA qui Révolutionne la Préparation des Cours" />
      <meta itemProp="author" content="PedagoIA" />
      <meta itemProp="datePublished" content="2024-03-19" />
      <meta itemProp="image" content="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" />
      
      <h2 className="text-3xl font-bold text-[#2c3e50] border-b border-gray-100 pb-4">
        Introduction : Dites adieu à la surcharge de travail
      </h2>
      
      <div itemProp="articleBody" className="space-y-8">
        <p className="text-lg leading-relaxed text-gray-700">
          Selon une récente étude du ministère de l'Éducation nationale, les enseignants français consacrent en moyenne <strong className="text-[#2c3e50]">14 heures par semaine</strong> à la préparation de leurs cours et aux tâches administratives. PedagoIA est né d'un constat simple : les enseignants méritent de consacrer plus de temps à l'essentiel - leurs élèves.
        </p>
        
        <blockquote className="pl-6 py-6 my-12 italic text-lg border-l-4 border-purple-500">
          <p className="text-gray-700">"PedagoIA m'a permis de réduire de 60% mon temps de préparation tout en créant des contenus plus personnalisés et engageants pour mes élèves."</p>
          <footer className="mt-4 text-gray-600 not-italic text-base">Marie L., professeure de français</footer>
        </blockquote>
        
        <p className="text-lg leading-relaxed text-gray-700">
          Dans ce guide complet, nous vous présentons <strong className="text-[#2c3e50]">l'assistant pédagogique intelligent</strong> qui transforme la manière dont les enseignants français préparent et organisent leurs cours. Découvrez comment <strong className="text-[#2c3e50]">l'intelligence artificielle au service de l'enseignement</strong> peut vous faire gagner un temps précieux tout en enrichissant la qualité de vos supports pédagogiques.
        </p>
      </div>
    </section>
  );
}
