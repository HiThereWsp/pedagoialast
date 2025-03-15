
import React from 'react';
import { UserMenu } from "@/components/home/UserMenu";
import { WelcomeMessage } from "@/components/home/WelcomeMessage";
import { ActionButtons } from "@/components/home/ActionButtons";
import { UpdateNotification } from "@/components/home/UpdateNotification";

interface DesktopContentProps {
  firstName: string;
}

export const DesktopContent = ({ firstName }: DesktopContentProps) => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center px-6 py-8 max-w-md mx-auto">
      <UserMenu />
      <WelcomeMessage firstName={firstName} />
      <ActionButtons />
      <UpdateNotification />
    </div>
  );
};
