import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SuggestionDialog } from './SuggestionDialog';
import { cn } from '@/lib/utils';

export const SuggestionButton = () => {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Suggérer une amélioration" 
        variant="secondary" 
        className="fixed bottom-4 right-20 z-50 p-3 shadow-lg rounded-3xl bg-slate-900 hover:bg-slate-800 transition-all duration-300"
      >
        <Lightbulb 
          className={cn(
            "h-5 w-5 transition-all duration-300",
            isHovered 
              ? "text-yellow-300 filter drop-shadow-[0_0_3px_rgba(253,224,71,0.8)]" 
              : "text-white"
          )} 
        />
      </Button>
      <SuggestionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}; 