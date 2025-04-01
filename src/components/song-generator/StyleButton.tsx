
import React from 'react';

interface StyleButtonProps {
  style: string;
  isActive: boolean;
  onClick: () => void;
}

export const StyleButton: React.FC<StyleButtonProps> = ({ style, isActive, onClick }) => {
  return (
    <button 
      className={`px-4 py-2 bg-white border rounded-md transition-colors ${
        isActive 
          ? 'border-purple-300 text-purple-700 bg-purple-50' 
          : 'border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
      }`}
      onClick={onClick}
    >
      {style}
    </button>
  );
};
