import { Home } from "lucide-react"
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
          </SidebarMenu>
          
          <div className="mt-4 px-2">
            <div className="flex items-center justify-center gap-2">
              <img 
                src="/lovable-uploads/a514063e-400f-4c84-b2f2-78114e277365.png" 
                alt="PedagoIA Logo" 
                className="h-8"
              />
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </Footer>
  )
}