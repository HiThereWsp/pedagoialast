import { MessageSquarePlus, MessageSquare, Lightbulb, Settings, LogOut, Trash2, User } from "lucide-react"
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
        <Button className="w-full bg-emerald-500 hover:bg-emerald-600" size="lg">
          <MessageSquarePlus className="mr-2 h-5 w-5" />
          Nouvelle conversation
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Nouvelle conversation</span>
                  </div>
                  <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  <span>Faire des suggestions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-red-500 hover:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6" />
          <span className="text-sm font-medium">andyguittaud</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}