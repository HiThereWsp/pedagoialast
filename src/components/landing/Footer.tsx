
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <img 
                src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
                alt="PedagoIA Logo" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400">
              L'assistant pédagogique intelligent
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <a 
              href="mailto:bonjour@pedagoia.fr"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Nous contacter
            </a>
            <a 
              href="/legal"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Mentions légales
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} PedagoIA. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
