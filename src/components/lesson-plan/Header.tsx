import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <Button 
        variant="ghost" 
        size="icon" 
        className="hover:bg-pink-50 w-10 h-10"
        onClick={() => navigate('/home')}
      >
        <ChevronLeft className="h-5 w-5 text-pink-600" />
      </Button>
    </div>
  );
}