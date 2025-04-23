
import React from 'react';
import { LucideIcon } from "lucide-react";
import { Tiles } from "@/components/ui/tiles";

export interface Feature {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface FeaturesNavigationProps {
  features: Feature[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function FeaturesNavigation({ features, activeTab, setActiveTab }: FeaturesNavigationProps) {
  return (
    <div className="bg-white py-10 relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <Tiles 
          rows={50}
          cols={8}
          tileSize="md"
        />
      </div>
      
      {/* Navigation content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-center mb-6 overflow-x-auto">
          <div className="flex space-x-8">
            {features.map((feature) => (
              <button 
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className="flex flex-col items-center group" 
              >
                {/* Icon container */}
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 
                    ${activeTab === feature.id 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-transparent text-gray-400 group-hover:text-orange-500'
                    }`}
                >
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>

                {/* Title */}
                <span 
                  className={`text-sm transition-colors duration-300
                    ${activeTab === feature.id 
                      ? 'text-orange-500 font-medium' 
                      : 'text-gray-400 group-hover:text-orange-500'
                    }`}
                >
                  {feature.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
