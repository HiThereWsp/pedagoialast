import { MessageSquarePlus, MessageSquare, Lightbulb, Settings, LogOut, User, Trash2 } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react"

interface AppSidebarProps {
  conversations?: Array<{id: string, title: string}>;
  onConversationSelect?: (id: string) => void;
  currentConversationId?: string | null;
  onNewConversation?: () => void;
  onDeleteConversation?: (id: string) => void;
}

export function AppSidebar({ 
  conversations = [], 
  onConversationSelect,
  currentConversationId,
  onNewConversation,
  onDeleteConversation
}: AppSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [firstName, setFirstName] = useState<string | null>(null)

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', session.user.id)
          .single()
        
        if (profile?.first_name) {
          setFirstName(profile.first_name)
        }
      }
    }

    getUserProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUserProfile()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    onDeleteConversation?.(conversationId)
  }

  return (
    <Sidebar collapsible="offcanvas" variant="floating" className="z-50">
      <SidebarRail />
      <SidebarHeader className="p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span className="truncate group-data-[collapsible=icon]:hidden">
              {firstName || 'Chargement...'}
            </span>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              className="group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:aspect-square bg-emerald-500 hover:bg-emerald-600 w-full transition-all duration-200" 
              size="lg"
              onClick={onNewConversation}
            >
              <MessageSquarePlus className="h-5 w-5" />
              <span className="ml-2 truncate group-data-[collapsible=icon]:hidden">Nouvelle conversation</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            Nouvelle conversation
          </TooltipContent>
        </Tooltip>
      </SidebarHeader>

      <SidebarContent>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto min-h-0 mb-20">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {conversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            className="w-full justify-between group"
                            onClick={() => onConversationSelect?.(conversation.id)}
                            data-active={currentConversationId === conversation.id}
                          >
                            <div className="flex items-center min-w-0 flex-1">
                              <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{conversation.title}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity group-data-[collapsible=icon]:hidden"
                              onClick={(e) => handleDelete(e, conversation.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                            </Button>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {conversation.title}
                        </TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-sidebar pt-2 pb-2 px-2">
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
                          data-active={location.pathname === '/settings'}
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
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}