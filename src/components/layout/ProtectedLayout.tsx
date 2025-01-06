import React from 'react';
import { Outlet } from 'react-router-dom';
import { GlobalHeader } from './GlobalHeader';

interface ProtectedLayoutProps {
  children?: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      <main className="pt-24 px-4 sm:px-6 lg:px-8">
        {children || <Outlet />}
      </main>
    </div>
  );
}