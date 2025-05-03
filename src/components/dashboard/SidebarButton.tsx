import React from 'react';
import { Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface SidebarButtonProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  path?: string;
  active?: boolean;
  small?: boolean;
  notAvailable?: boolean;
  notAvailableIcon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const SidebarButton = ({ 
  icon, 
  label, 
  path,
  active = false, 
  small = false, 
  notAvailable = false, 
  notAvailableIcon = <span className="ml-auto flex items-center text-xs font-medium whitespace-nowrap">
    <Clock className="h-3.5 w-3.5 text-amber-500" />
    <span className="ml-1 text-amber-500">bientôt disponible</span>
  </span>,
  onClick = () => {},
  className = ""
}: SidebarButtonProps) => {
  const location = useLocation();
  
  // Vérifier si le bouton est actif en comparant le chemin actuel
  const isActive = active || (path && location.pathname === path);
  
  // Gérer le clic en fonction des props
  const handleClick = () => {
    if (!notAvailable) {
      onClick();
    }
  };
  
  return (
    <button 
      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive 
          ? 'bg-purple-100 text-purple-700' 
          : 'text-gray-700 hover:bg-gray-100'
      } ${small ? 'text-xs' : ''} ${notAvailable ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onClick={handleClick}
      disabled={notAvailable}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {notAvailable && notAvailableIcon}
    </button>
  );
};

export default SidebarButton;
