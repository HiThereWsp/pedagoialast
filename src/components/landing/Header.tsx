import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="PedagoIA Logo" className="w-8 h-8" />
            <span className="text-xl font-semibold">PedagoIA</span>
          </div>
          <div>
            <Button 
              variant="outline"
              onClick={handleLoginClick}
              className="font-medium"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}