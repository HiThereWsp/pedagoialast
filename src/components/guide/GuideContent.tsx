
import React from 'react';
import { IntroductionSection } from './IntroductionSection';
import { TableOfContents } from './TableOfContents';
import { FirstStepsSection } from './FirstStepsSection';
import { SequenceGeneratorSection } from './SequenceGeneratorSection';
import { ExercisesSection } from './ExercisesSection';
import { ImageGeneratorSection } from './ImageGeneratorSection';
import { DifferentiationSection } from './DifferentiationSection';
import { SuggestionsSection } from './SuggestionsSection';
import { GuideFAQSection } from './FAQSection';
import { ConclusionSection } from './ConclusionSection';

export function GuideContent() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-16">
          <IntroductionSection />
          <TableOfContents />
          <FirstStepsSection />
          <SequenceGeneratorSection />
          <ExercisesSection />
          <DifferentiationSection />
          <ImageGeneratorSection />
          <SuggestionsSection />
          <GuideFAQSection />
          <ConclusionSection />
          
          {/* Footer avec mise à jour */}
          <footer className="mt-24 pt-8 border-t border-gray-200 text-gray-600 text-base italic">
            <p>Ce guide a été mis à jour le {new Date().toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</p>
          </footer>
        </div>
      </div>
    </section>
  );
}
