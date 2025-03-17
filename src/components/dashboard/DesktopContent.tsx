
import React from 'react';
import { WelcomeMessage } from "@/components/home/WelcomeMessage";
import { ToolsCarousel } from "@/components/home/ToolsCarousel";

interface DesktopContentProps {
  firstName: string;
}

export const DesktopContent = ({ firstName }: DesktopContentProps) => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 ml-0 md:ml-64">
      <div className="max-w-7xl w-full">
        <WelcomeMessage firstName={firstName} />
        <ToolsCarousel />
      </div>
    </div>
  );
};
