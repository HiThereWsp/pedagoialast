import { useNavigate, useLocation } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { SidebarHeader } from "./sidebar/SidebarHeader"
import { ConversationList } from "./sidebar/ConversationList"
import { SidebarFooter } from "./sidebar/SidebarFooter"

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

  return (
    <Sidebar collapsible="offcanvas" variant="floating" className="z-50">
      <SidebarRail />
      <SidebarHeader firstName={firstName} onNewConversation={onNewConversation} />
      
      <SidebarContent>
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto min-h-0 mb-20">
            <ConversationList 
              conversations={conversations}
              onConversationSelect={onConversationSelect}
              currentConversationId={currentConversationId}
              onDeleteConversation={onDeleteConversation}
            />
          </div>

          <SidebarFooter 
            onLogout={handleLogout}
            currentPath={location.pathname}
          />
        </div>
      </SidebarContent>
    </Sidebar>
  )
}