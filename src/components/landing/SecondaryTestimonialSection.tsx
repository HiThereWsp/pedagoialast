
import React from 'react';
import { Testimonial } from "@/components/ui/testimonial";

export function SecondaryTestimonialSection() {
  return (
    <Testimonial
      quote="Utiliser pedagoIA au cours de l'année c'est comme avoir un assistant expérimenté disponible partout même en classe !"
      highlightedText="assistant expérimenté disponible partout"
      authorName="Melissa"
      authorPosition="Maîtresse en CM2"
      authorImage="/lovable-uploads/90756d9e-4471-46f6-87b4-7bfeb3185c6a.png"
      className="bg-gray-50"
    />
  );
}
