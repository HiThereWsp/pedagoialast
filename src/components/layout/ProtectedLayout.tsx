import React from 'react';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen">
      <main className="px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}