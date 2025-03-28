
import React from "react";
import { SavedContentView } from "@/components/saved-content/SavedContentView";
import { useIsMobile } from '@/hooks/use-mobile';
import { SEO } from "@/components/SEO";

export default function SavedContentPage() {
  const isMobile = useIsMobile();
  
  return (
    <>
      <SEO 
        title="Mes ressources pédagogiques | PedagoIA"
        description="Retrouvez toutes vos ressources pédagogiques sauvegardées."
      />
      <div className="container mx-auto py-4 md:py-6 px-4">
        <div className={`text-center mb-4 ${isMobile ? '' : 'md:mb-6'}`}>
          <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-extrabold tracking-tight mb-2`}>
            <span className="bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] bg-clip-text text-transparent">
              Mes ressources pédagogiques
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
            Retrouvez ici toutes vos ressources sauvegardées.
          </p>
        </div>
        <SavedContentView />
      </div>
    </>
  );
}
