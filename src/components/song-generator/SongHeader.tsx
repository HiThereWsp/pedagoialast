
import React from 'react';

interface SongHeaderProps {
  onBack: () => void;
}

export const SongHeader: React.FC<SongHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center">
        <button className="text-gray-700 mr-3" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-lg font-medium">
          <span className="text-yellow-500">peda</span>
          <span className="text-purple-600">GOIA</span>
        </div>
      </div>
      <span className="text-gray-600 text-sm">0 Crédits</span>
    </div>
  );
};
