import React from 'react';
import { GlobalHeader } from './GlobalHeader';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen">
      <GlobalHeader />
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}