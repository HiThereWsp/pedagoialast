
import React from 'react';
import { Menu, X } from 'lucide-react';

interface SidebarToggleProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const SidebarToggle = ({ sidebarOpen, toggleSidebar }: SidebarToggleProps) => {
  return (
    <button
      className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20"
      onClick={toggleSidebar}
      aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
    >
      {sidebarOpen ? <X className="h-6 w-6 text-primary" /> : <Menu className="h-6 w-6 text-primary" />}
    </button>
  );
};

export default SidebarToggle;
