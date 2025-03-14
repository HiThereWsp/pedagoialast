
import React from "react";
import { SavedContentView } from "@/components/saved-content/SavedContentView";
import { useIsMobile } from '@/hooks/use-mobile';

export default function SavedContentPage() {
  const isMobile = useIsMobile();
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="text-center mb-6 md:mb-8">
        <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-extrabold leading-tight tracking-tight text-balance mb-2`}>
          Mes <span className="bg-black text-white px-2 py-1 rounded">ressources</span>
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
          Retrouvez ici toutes vos ressources sauvegardées.
        </p>
      </div>
      <SavedContentView />
    </div>
  );
}
