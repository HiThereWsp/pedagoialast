import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
              alt="PedagoIA Logo" 
              className="h-16 w-auto"
            />
          </div>
          
          <div className="flex justify-center space-x-8 mb-8">
            <a 
              href="/contact"
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
        
        <div className="border-t border-gray-800 mt-4 pt-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} PedagoIA. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
