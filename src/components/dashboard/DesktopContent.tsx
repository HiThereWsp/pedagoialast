
import React from 'react';
import { WelcomeMessage } from "@/components/home/WelcomeMessage";
import { ActionButtons } from "@/components/home/ActionButtons";
import { Footer } from "@/components/home/Footer";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";

interface DesktopContentProps {
  firstName: string;
}

export const DesktopContent = ({ firstName }: DesktopContentProps) => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-6 py-12 max-w-4xl mx-auto">
      <WelcomeMessage firstName={firstName} />
      
      {/* État de l'abonnement */}
      <div className="w-full max-w-md mb-8">
        <SubscriptionStatus />
      </div>
      
      {/* Principaux boutons d'action */}
      <div className="w-full max-w-md">
        <ActionButtons />
      </div>
      
      <Footer />
    </div>
  );
};
