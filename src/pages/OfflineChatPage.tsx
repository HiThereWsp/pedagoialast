
import { SEO } from "@/components/SEO"
import { OfflineChatUI } from "@/components/offline-chat/OfflineChatUI"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useConversationManagement } from "@/hooks/chat/useConversationManagement"

const OfflineChatPage = () => {
  const isMobile = useIsMobile()
  const [firstName, setFirstName] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()

  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    loadConversations,
    createNewConversation,
    deleteConversation
  } = useConversationManagement(userId)

  // Get initial session
  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id || null)
    }
    getInitialSession()
  }, [])

  useEffect(() => {
    if (userId) {
      loadConversations()
    }
  }, [userId, loadConversations])

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', session.user.id)
          .single()

        if (error) throw error
        if (profile) {
          setFirstName(profile.first_name)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger votre profil."
        })
      }
    }

    getProfile()
  }, [toast])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion."
      })
    }
  }

  return (
    <>
      <SEO 
        title="Élia - L'assistant pédagogique - PedagoIA"
        description="Discutez avec Élia, votre assistant pédagogique, même sans connexion internet"
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-white">
          <AppSidebar 
            conversations={conversations}
            onConversationSelect={setCurrentConversationId}
            currentConversationId={currentConversationId}
            onDeleteConversation={deleteConversation}
            onLogout={handleLogout}
            firstName={firstName}
            onNewConversation={() => setCurrentConversationId(null)}
          />
          <main className="flex-1">
            <div className="container mx-auto h-screen p-4">
              <OfflineChatUI 
                currentConversationId={currentConversationId}
                onNewConversation={createNewConversation}
              />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  )
}

export default OfflineChatPage
