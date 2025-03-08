
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tiles } from "@/components/ui/tiles";

export function ToolsCTA() {
  return (
    <div className="py-12 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <Tiles 
          rows={50}
          cols={8}
          tileSize="md"
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <Button 
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 transition-all duration-300 text-lg px-8 py-6 rounded-xl shadow-premium hover:shadow-premium-lg transform hover:scale-105 group"
          >
            Je découvre tous les outils
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="mt-4 text-sm text-muted-foreground">
            Accès à tous les outils inclus dans votre abonnement
          </p>
        </div>
      </div>
    </div>
  );
}
