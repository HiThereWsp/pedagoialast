import { Lightbulb, Settings, LogOut, CreditCard } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
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
    <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-sidebar pt-2 pb-2 px-2">
      <Button
        onClick={() => navigate('/pricing')}
        size="sm"
        className="w-full mb-2 bg-gradient-to-r from-[#FEF7CD] via-[#FFDEE2] to-[#FEC6A1] text-gray-700 hover:from-[#FEF7CD]/90 hover:via-[#FFDEE2]/90 hover:to-[#FEC6A1]/90 transition-all duration-300 shadow-sm"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        <span className="truncate">Passer Premium</span>
      </Button>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton>
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
  )
}