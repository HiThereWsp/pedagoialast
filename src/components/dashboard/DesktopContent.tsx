
import React from 'react';
import { WelcomeMessage } from "@/components/home/WelcomeMessage";
import { ToolsCarousel } from "@/components/home/ToolsCarousel";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface DesktopContentProps {
  firstName: string;
  isLoading?: boolean;
}

export const DesktopContent = ({ firstName, isLoading = false }: DesktopContentProps) => {
  if (isLoading) {
    return (
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 ml-0 md:ml-64">
        <LoadingIndicator 
          message="Chargement du tableau de bord..."
          type="spinner"
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 ml-0 md:ml-64">
      <div className="max-w-7xl w-full">
        <WelcomeMessage firstName={firstName} />
        <ToolsCarousel />
      </div>
    </div>
  );
};
