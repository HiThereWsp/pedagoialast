import React from 'react';
import { LogIn } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Si déjà connecté, rediriger vers /chat
      navigate('/chat');
      return;
    }

    // Si non connecté, stocker la page actuelle et rediriger vers login
    const currentPath = location.pathname;
    // Ne pas rediriger vers login ou waitlist après authentification
    const returnUrl = ['/login', '/waitlist'].includes(currentPath) ? '/chat' : currentPath;
    
    navigate('/login', { 
      state: { returnUrl } 
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="PedagoIA Logo" className="w-8 h-8" />
            <span className="text-xl font-semibold">PedagoIA</span>
          </div>
          <Button 
            variant="ghost"
            onClick={handleLogin}
            className="flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Se connecter
          </Button>
        </div>
      </div>
    </header>
  );
}