import React from 'react';

export function GlobalHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-sm border-b h-16 flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="PedagoIA Logo" className="w-8 h-8" />
          <span className="text-xl font-semibold">PedagoIA</span>
        </div>
      </div>
    </header>
  );
}