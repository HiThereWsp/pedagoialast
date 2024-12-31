import React from 'react';
import { LogIn } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    // Store the current location to redirect back after login
    const currentPath = location.pathname;
    navigate('/login', { 
      state: { 
        returnUrl: currentPath === '/login' ? '/chat' : currentPath 
      } 
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