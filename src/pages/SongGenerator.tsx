
import React from 'react';
import { SEO } from "@/components/SEO";
import { SongCreator } from "@/components/song-generator/SongCreator";

const SongGenerator = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none"></div>
      <SEO 
        title="PedagoIA - Générateur de chansons pédagogiques"
        description="Créez des chansons pédagogiques adaptées à votre classe en quelques clics."
      />
      
      <main className="relative z-10">
        <SongCreator />
      </main>
    </div>
  );
};

export default SongGenerator;
