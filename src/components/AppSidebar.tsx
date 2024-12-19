import { MessageSquarePlus, MessageSquare, Lightbulb, Settings, LogOut, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function AppSidebar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarRail />
      <SidebarHeader className="p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600" size="lg">
              <MessageSquarePlus className="h-5 w-5" />
              <span className="ml-2 truncate">Nouvelle conversation</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Nouvelle conversation
          </TooltipContent>
        </Tooltip>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between">
                      <div className="flex items-center min-w-0">
                        <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Nouvelle conversation</span>
                      </div>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Nouvelle conversation
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
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
                    <SidebarMenuButton>
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
                    <SidebarMenuButton onClick={handleLogout} className="text-red-500 hover:text-red-600">
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
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 min-w-0">
          <User className="h-6 w-6 flex-shrink-0" />
          <span className="text-sm font-medium truncate">andyguittaud</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}