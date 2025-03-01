
import React from 'react';
import { Tiles } from "@/components/ui/tiles";

export function CopiloteSection() {
  return (
    <section className="relative py-16 bg-white border-t border-gray-200 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <Tiles 
          rows={50}
          cols={8}
          tileSize="md"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Image placée avant le texte */}
          <div className="w-full mb-8 rounded-lg overflow-hidden">
            <div className="w-full h-64 bg-secondary/20 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Image placeholder</p>
            </div>
          </div>
          
          {/* Texte rapproché */}
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">L'IA comme copilote</h2>
            <p className="text-xl text-muted-foreground">
              Des outils conçus pour alléger drastiquement votre charge de travail
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
