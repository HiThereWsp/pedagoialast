
import React from 'react';
import { Menu, X } from 'lucide-react';

interface SidebarToggleProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const SidebarToggle = ({ sidebarOpen, toggleSidebar }: SidebarToggleProps) => {
  return (
    <button
      className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-md"
      onClick={toggleSidebar}
    >
      {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  );
};
