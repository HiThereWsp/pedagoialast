
import React from 'react';
import { Tiles } from "@/components/ui/tiles";
import { ImageCarousel } from "@/components/landing/ImageCarousel";

// Tableau d'images et de GIFs à faire défiler
const demoImages = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
];

export function CopiloteSection() {
  return (
    <section className="relative py-16 bg-white border-t border-gray-200 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <Tiles 
          rows={50}
          cols={8}
          tileSize="md"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          {/* Carousel d'images remplaçant le placeholder */}
          <div className="w-full mb-8 rounded-lg overflow-hidden shadow-lg">
            <div className="w-full h-64 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-100">
              <ImageCarousel images={demoImages} />
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
