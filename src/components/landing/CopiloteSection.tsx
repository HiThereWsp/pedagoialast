
import React from 'react';
import { Tiles } from "@/components/ui/tiles";

export function CopiloteSection() {
  return (
    <section className="relative py-24 bg-white border-t border-gray-200 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <Tiles 
          rows={50}
          cols={8}
          tileSize="md"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-balance">
              L'IA comme copilote
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Des outils conçus pour alléger drastiquement votre charge de travail
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
