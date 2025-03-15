
import React from "react";
import { SavedContentView } from "@/components/saved-content/SavedContentView";
import { useIsMobile } from '@/hooks/use-mobile';

export default function SavedContentPage() {
  const isMobile = useIsMobile();
  
  return (
    <div className="container mx-auto py-4 md:py-6 px-4">
      <div className={`text-center mb-4 ${isMobile ? '' : 'md:mb-6'}`}>
        <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-extrabold leading-tight tracking-tight text-balance mb-2`}>
          Mes <span className="underline decoration-dashed underline-offset-4">ressources</span> <span className="bg-black text-white px-2 py-1 rounded rotate-1 inline-block">pédagogiques</span>
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base">
          Retrouvez ici toutes vos ressources sauvegardées.
        </p>
      </div>
      <SavedContentView />
    </div>
  );
}
