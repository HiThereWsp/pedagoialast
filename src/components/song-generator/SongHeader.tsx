
import React from 'react';
import { BackButton } from '@/components/settings/BackButton';

interface SongHeaderProps {
  onBack: () => void;
}

export const SongHeader: React.FC<SongHeaderProps> = ({
  onBack
}) => {
  return (
    <header className="bg-white border-b border-gray-100 p-4 shadow-sm">
      <div className="container max-w-screen-xl mx-auto flex items-center">
        <BackButton fallbackPath="/tableaudebord" />
        <h2 className="text-xl font-semibold text-gray-700 ml-2">Générateur de chansons</h2>
      </div>
    </header>
  );
};
