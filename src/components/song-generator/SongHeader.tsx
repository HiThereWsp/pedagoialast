
import React from 'react';
import { BackButton } from '@/components/settings/BackButton';

interface SongHeaderProps {
  onBack: () => void;
}

export const SongHeader: React.FC<SongHeaderProps> = ({
  onBack
}) => {
  return (
    <header className="bg-white border-b border-gray-100 p-4 shadow-sm flex items-center">
      <BackButton fallbackPath="/tableaudebord" />
      <h1 className="text-xl font-semibold text-gray-800 flex-1 text-center pr-8">
        Générateur de chansons
      </h1>
    </header>
  );
};
