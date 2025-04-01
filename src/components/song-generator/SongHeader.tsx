import React from 'react';
import { BackButton } from '@/components/settings/BackButton';
interface SongHeaderProps {
  onBack: () => void;
}
export const SongHeader: React.FC<SongHeaderProps> = ({
  onBack
}) => {
  return <header className="bg-white border-b border-gray-100 p-4 shadow-sm">
      
    </header>;
};