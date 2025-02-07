
import { Home, UserRound } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  SidebarFooter as Footer,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SidebarFooterProps {
  onLogout: () => void;
  currentPath: string;
  firstName?: string | null;
}

export function SidebarFooter({ onLogout, currentPath, firstName }: SidebarFooterProps) {
  const navigate = useNavigate()

  return (
    <Footer>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={() => navigate('/home')}
                    data-active={currentPath === '/home'}
                  >
                    <Home className="h-4 w-4" />
                    <span>Accueil</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Retour à l'accueil
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={() => navigate('/settings')}
                    data-active={currentPath === '/settings'}
                    className="flex items-center gap-2"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-gray-100 text-gray-600">
                        <UserRound className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span>{firstName || 'Profil'}</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Gérer mon profil
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </Footer>
  )
}
