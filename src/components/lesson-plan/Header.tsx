import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-6 md:space-y-0 mb-8 animate-fade-in">
      <Button 
        variant="ghost" 
        size="icon" 
        className="hover:bg-pink-50 w-10 h-10 self-start"
        onClick={() => navigate('/chat')}
      >
        <ChevronLeft className="h-5 w-5 text-pink-600" />
      </Button>
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 bg-clip-text text-transparent">
          Créer une séquence pédagogique
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Créez vos séquences pédagogiques à partir de la source de votre choix
        </p>
      </div>
    </div>
  );
}