
import React from 'react';
import { WelcomeMessage } from "@/components/home/WelcomeMessage";
import { Footer } from "@/components/home/Footer";

interface DesktopContentProps {
  firstName: string;
}

export const DesktopContent = ({ firstName }: DesktopContentProps) => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
      <WelcomeMessage firstName={firstName} />
      <Footer />
    </div>
  );
};
