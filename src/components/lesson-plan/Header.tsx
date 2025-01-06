import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center space-x-4 mb-6">
      <Button 
        variant="ghost" 
        size="icon" 
        className="hover:bg-gray-100"
        onClick={() => navigate('/chat')}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <div>
        <h1 className="text-2xl font-bold">Créer une séquence pédagogique</h1>
        <p className="text-gray-600">
          Créez vos séquences pédagogiques à partir de la source de votre choix
        </p>
      </div>
    </div>
  );
}