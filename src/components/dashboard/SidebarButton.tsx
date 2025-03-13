
import React from 'react';
import { Clock } from 'lucide-react';

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  small?: boolean;
  notAvailable?: boolean;
  notAvailableIcon?: React.ReactNode;
  onClick?: () => void;
}

export const SidebarButton = ({ 
  icon, 
  label, 
  active = false, 
  small = false, 
  notAvailable = false, 
  notAvailableIcon = <Clock className="h-3.5 w-3.5 text-amber-500" />,
  onClick = () => {}
}: SidebarButtonProps) => {
  return (
    <button 
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active 
          ? 'bg-purple-100 text-purple-700' 
          : 'text-gray-700 hover:bg-gray-100'
      } ${small ? 'text-xs' : ''} ${notAvailable ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={onClick}
      disabled={notAvailable}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {notAvailable && (
        <span className="ml-auto flex items-center text-xs font-medium">
          {notAvailableIcon}
          <span className="ml-1 text-amber-500">Bientôt</span>
        </span>
      )}
    </button>
  );
};

export default SidebarButton;
