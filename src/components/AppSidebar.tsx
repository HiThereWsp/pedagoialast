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
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Vérifie si un profil existe
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', session.user.id)
            .maybeSingle()
          
          if (profile?.first_name) {
            setFirstName(profile.first_name)
          } else {
            // Si aucun profil n'existe, on en crée un
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([
                { id: session.user.id, first_name: 'Anonymous' }
              ])
              .select('first_name')
              .single()

            if (insertError) {
              console.error('Error creating profile:', insertError)
              setFirstName('Anonymous')
            } else if (newProfile) {
              setFirstName(newProfile.first_name)
            }
          }
        }
      } catch (error) {
        console.error('Error in getUserProfile:', error)
        setFirstName('Anonymous')
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