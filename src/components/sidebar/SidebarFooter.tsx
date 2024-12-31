import { Lightbulb, Settings, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarFooterProps {
  onLogout: () => void;
  currentPath: string;
}

export function SidebarFooter({ onLogout, currentPath }: SidebarFooterProps) {
  const navigate = useNavigate()

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border bg-sidebar">
      <div className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton 
                      onClick={() => navigate('/suggestions')}
                      data-active={currentPath === '/suggestions'}
                    >
                      <Lightbulb className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Faire des suggestions</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Faire des suggestions
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton 
                      onClick={() => navigate('/settings')}
                      data-active={currentPath === '/settings'}
                    >
                      <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Paramètres</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Paramètres
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton onClick={onLogout} className="text-red-500 hover:text-red-600">
                      <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Déconnexion</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Déconnexion
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </div>
    </div>
  )
}