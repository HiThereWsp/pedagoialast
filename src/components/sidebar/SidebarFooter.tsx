import { Settings, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface SidebarFooterProps {
  onLogout: () => void;
  currentPath: string;
}

export function SidebarFooter({ onLogout, currentPath }: SidebarFooterProps) {
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
                    onClick={() => navigate('/creersequence')}
                    data-active={currentPath === '/creersequence'}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Créateur de séquences</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Créateur de séquences pédagogiques
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
                    <Settings className="h-4 w-4" />
                    <span>Paramètres</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Paramètres
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={onLogout}
              >
                Se déconnecter
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </Footer>
  )
}