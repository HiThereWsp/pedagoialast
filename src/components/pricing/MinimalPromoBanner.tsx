import React from 'react';

const MinimalPromoBanner = () => {
  return (
    <div className="w-full bg-gradient-to-r from-orange-500/90 to-pink-600/90 text-white py-2 px-4 mb-8 text-center rounded-md shadow-sm relative overflow-hidden">
      {/* Effet de brillance */}
      <span className="absolute -inset-x-40 h-full top-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer-slow pointer-events-none"></span>
      
      <p className="font-medium">
        Pour la fête du travail, profitez de <span className="font-bold">-40 % de remise immédiate</span> avec le code <span className="font-bold bg-white/20 px-2 py-1 rounded">TRAVAILLEQUIPEUT</span>.
      </p>
    </div>
  );
};

export default MinimalPromoBanner; 