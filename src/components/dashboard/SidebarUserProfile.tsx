
import React from 'react';
import { Settings, HelpCircle, LogOut, Mail, Users, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";

interface SidebarUserProfileProps {
  firstName: string;
  onLogout: () => void;
}

export const SidebarUserProfile = ({ firstName, onLogout }: SidebarUserProfileProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile(user);
  const isAdmin = profile?.is_admin === true;

  return (
      <div className="border-t border-gray-200 p-4">
        <div className="flex flex-col gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-gray-100 transition-colors w-full">
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-medium">
                {firstName ? firstName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{firstName || 'Utilisateur'}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
                <Mail className="mr-2 h-4 w-4" />
                <span>Nous contacter</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Aide</span>
              </DropdownMenuItem>
              
              {/* Show admin options only for admin users */}
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/user-management')} className="cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Gestion des utilisateurs</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/bug-reports')} className="cursor-pointer">
                    <Bug className="mr-2 h-4 w-4" />
                    <span>Signalements de bugs</span>
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
  );
};

export default SidebarUserProfile;
