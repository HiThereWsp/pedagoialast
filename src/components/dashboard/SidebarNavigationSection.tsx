
import React from 'react';
import { Separator } from "@/components/ui/separator";
import SidebarNavItem from './SidebarNavItem';

interface SidebarNavigationSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  hasSeparator?: boolean;
}

export const SidebarNavigationSection = ({ 
  title, 
  children, 
  className = "",
  hasSeparator = false
}: SidebarNavigationSectionProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h3 className="px-3 text-xs font-semibold uppercase text-gray-500">{title}</h3>
      )}
      <div className="space-y-3">
        {children}
      </div>
      {hasSeparator && <Separator className="my-6" />}
    </div>
  );
};

export default SidebarNavigationSection;
