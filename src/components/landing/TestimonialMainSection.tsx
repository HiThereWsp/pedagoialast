
import React from 'react';

export function TestimonialMainSection() {
  return (
    <section className="container mx-auto px-4 py-16 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="bg-blue-50 p-8 rounded-lg shadow-premium">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-blue-100 overflow-hidden">
                <div className="w-full h-full bg-blue-200/60"></div>
              </div>
            </div>
            <div>
              <blockquote className="text-xl md:text-2xl mb-4 text-gray-800">
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
