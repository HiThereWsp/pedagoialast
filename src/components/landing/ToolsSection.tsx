
import React, { useState } from 'react';
import { toolFeatures } from './tools/toolFeatures';
import { ToolsNavigation } from './tools/ToolsNavigation';
import { FeatureContent } from './tools/FeatureContent';
import { ToolsCTA } from './tools/ToolsCTA';

export function ToolsSection() {
  const [activeTab, setActiveTab] = useState('evaluation');
  const activeFeature = toolFeatures.find(feature => feature.id === activeTab);
  
  // If for some reason we can't find the active feature, use the first one
  const displayFeature = activeFeature || toolFeatures[0];

  return (
    <section className="w-full">
      {/* Navigation des outils */}
      <ToolsNavigation 
        features={toolFeatures} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      {/* Contenu de l'outil sélectionné */}
      <FeatureContent feature={displayFeature} />
      
      {/* Section CTA */}
      <ToolsCTA />
    </section>
  );
}
