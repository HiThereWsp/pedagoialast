
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "@/components/dashboard/Sidebar";
import { useSidebar } from "@/hooks/use-sidebar";

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  firstName: string;
}

export const DashboardSidebar = ({ sidebarOpen, toggleSidebar, firstName }: DashboardSidebarProps) => {
  return (
    <div className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-lg`}>
      <div className="flex flex-col h-full">
        {/* Logo centré avec taille augmentée */}
        <div className="flex justify-center items-center py-4 border-b border-gray-200">
          <a href="/tableaudebord" className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
              alt="PedagoIA Logo" 
              className="h-16 w-16" 
            />
          </a>
        </div>
        
        {/* Sidebar content rendered using the Sidebar component */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} firstName={firstName} />
      </div>
    </div>
  );
};

export default DashboardSidebar;
