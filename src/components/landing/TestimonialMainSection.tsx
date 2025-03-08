
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function TestimonialMainSection() {
  return (
    <section className="container mx-auto px-4 py-16 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 p-8 rounded-lg shadow-premium hover:shadow-premium-lg transition-all duration-300">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-primary text-primary-foreground font-extrabold">
                  M
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <blockquote className="text-xl md:text-2xl lg:text-3xl mb-4 text-gray-800 text-balance leading-tight tracking-tight font-bold">
                <span className="rotate-1 inline-block">«</span> Utiliser pedagoIA au cours de l'année c'est comme avoir un assistant 
                <span> expérimenté disponible partout</span> même en classe ! <span className="-rotate-1 inline-block">»</span>
              </blockquote>
              <p className="text-gray-600 font-medium">
                - Melissa, maîtresse en CM2
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
