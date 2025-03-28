
import React, { useEffect } from 'react';

export function SenjaTestimonialsSection() {
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://widget.senja.io/widget/cace3fcd-10a6-4933-98e1-8c0b0a9a814e/platform.js';
    script.async = true;
    script.type = 'text/javascript';
    
    // Append script to document
    document.body.appendChild(script);
    
    // Cleanup function to remove script when component unmounts
    return () => {
      // Check if the script still exists in the DOM
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  return (
    <section className="py-16 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Témoignages vérifiés
        </h2>
        <div className="senja-embed" 
          data-id="cace3fcd-10a6-4933-98e1-8c0b0a9a814e" 
          data-mode="shadow" 
          data-lazyload="false" 
          style={{ display: 'block', width: '100%' }}
        />
      </div>
    </section>
  );
}
