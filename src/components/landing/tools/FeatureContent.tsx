
import React from 'react';
import { Check, Clock, Lightbulb, Smile, Star } from 'lucide-react';
import { ToolFeature } from './toolFeatures';

interface FeatureContentProps {
  feature: ToolFeature;
}

export function FeatureContent({ feature }: FeatureContentProps) {
  return (
    <div className="py-12 bg-blue-50 overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">{feature.title}</h2>
          
          <ul className="space-y-6">
            {feature.content.map((item, index) => {
              const isMetric = index >= feature.content.length - 2;
              return (
                <li key={index} className={`flex items-start ${isMetric ? 'text-green-500 font-medium' : ''}`}>
                  <span className="mr-3 flex-shrink-0 mt-0.5">
                    {isMetric && index === feature.content.length - 2 ? (
                      <Clock className="h-6 w-6 text-green-500" />
                    ) : isMetric && index === feature.content.length - 1 ? (
                      item.includes("Plaisir") ? <Smile className="h-6 w-6 text-green-500" /> : 
                      item.includes("Maux") ? <Lightbulb className="h-6 w-6 text-green-500" /> : 
                      <Star className="h-6 w-6 text-green-500" />
                    ) : (
                      <Check className="h-6 w-6 text-green-500" />
                    )}
                  </span>
                  <span>{item}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
