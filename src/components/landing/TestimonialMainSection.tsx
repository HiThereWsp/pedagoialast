
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function TestimonialMainSection() {
  return (
    <section className="container mx-auto px-4 py-16 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 p-8 rounded-lg shadow-premium">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
                <AvatarImage 
                  src="/lovable-uploads/90756d9e-4471-46f6-87b4-7bfeb3185c6a.png" 
                  alt="Photo de Melissa, maîtresse en CM2" 
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  M
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <blockquote className="text-xl md:text-2xl mb-4 text-gray-800 text-balance leading-tight tracking-tight font-bold">
                « Utiliser pedagoIA au cours de l'année c'est comme avoir un assistant expérimenté disponible partout même en classe ! »
              </blockquote>
              <p className="text-gray-600">
                - Melissa, maîtresse en CM2
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
