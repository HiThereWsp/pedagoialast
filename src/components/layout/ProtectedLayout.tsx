import React from 'react';
import { Outlet } from 'react-router-dom';
import { GlobalHeader } from './GlobalHeader';

export function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      <main className="pt-24">
        <Outlet />
      </main>
    </div>
  );
}