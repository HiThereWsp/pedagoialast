
import React from 'react';

const Footer = () => {
  return (
    <footer className="py-6 md:py-10 border-t bg-gradient-to-b from-background to-secondary/5">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-2">
            <img 
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
              alt="PedagoIA Logo" 
              className="h-10 w-auto"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            L'assistant pédagogique intelligent
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          <a 
            href="mailto:bonjour@pedagoia.fr"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Nous contacter
          </a>
          <a 
            href="/legal"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Mentions légales
          </a>
        </div>
      </div>
      <div className="container mt-6 pt-4 border-t border-muted/50">
        <p className="text-xs text-center text-muted-foreground">© {new Date().getFullYear()} PedagoIA. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;
