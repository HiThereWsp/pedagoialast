import React from 'react';
import SidebarButton from './SidebarButton';

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  path?: string;
  onClick?: () => void;
  notAvailable?: boolean;
  notAvailableIcon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const SidebarNavItem = ({ 
  icon, 
  label, 
  path, 
  onClick, 
  notAvailable = false,
  notAvailableIcon,
  badge,
  className = ""
}: SidebarNavItemProps) => {
  return (
    <SidebarButton 
      icon={icon} 
      label={label} 
      path={path}
      onClick={onClick}
      notAvailable={notAvailable}
      notAvailableIcon={notAvailableIcon}
      className={className}
    />
  );
};

export default SidebarNavItem;
