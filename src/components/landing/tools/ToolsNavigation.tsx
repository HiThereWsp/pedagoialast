
import React from 'react';
import { ToolFeature } from './toolFeatures';
import { Tiles } from "@/components/ui/tiles";

interface ToolsNavigationProps {
  features: ToolFeature[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function ToolsNavigation({ features, activeTab, setActiveTab }: ToolsNavigationProps) {
  return (
    <div className="bg-white py-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <Tiles 
          rows={50}
          cols={8}
          tileSize="md"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-center mb-6 overflow-x-auto">
          <div className="flex space-x-8">
            {features.map((feature) => (
              <button 
                key={feature.id}
                className="flex flex-col items-center group" 
                onClick={() => setActiveTab(feature.id)}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${activeTab === feature.id ? 'bg-orange-500' : 'bg-transparent text-gray-400 group-hover:text-orange-500'}`}>
                  <div className={activeTab === feature.id ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'}>
                    {feature.icon}
                  </div>
                </div>
                <span className={`text-sm ${activeTab === feature.id ? 'text-orange-500 font-medium' : 'text-gray-400 group-hover:text-orange-500'}`}>
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
