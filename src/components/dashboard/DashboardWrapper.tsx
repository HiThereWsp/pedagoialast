
import React from 'react';
import { Tiles } from "@/components/ui/tiles";

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export const DashboardWrapper = ({ children }: DashboardWrapperProps) => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="fixed inset-0 overflow-hidden">
        <Tiles
          rows={50}
          cols={8}
          tileSize="md"
          className="opacity-30"
        />
      </div>
      
      {/* Main content */}
      {children}
    </div>
  );
};
