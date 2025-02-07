
import { SEO } from "@/components/SEO"
import { OfflineChatUI } from "@/components/offline-chat/OfflineChatUI"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const OfflineChatPage = () => {
  const isMobile = useIsMobile()
  const [firstName, setFirstName] = useState<string | null>(null)
  const { toast } = useToast()

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

  return (
    <>
      <SEO 
        title="Élia - L'assistant pédagogique - PedagoIA"
        description="Discutez avec Élia, votre assistant pédagogique, même sans connexion internet"
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-white">
          <AppSidebar 
            conversations={[]}
            onConversationSelect={() => {}}
            onDeleteConversation={() => {}}
            onLogout={() => {}}
            firstName={firstName}
          />
          <main className="flex-1">
            <div className="container mx-auto h-screen p-4">
              <OfflineChatUI />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  )
}

export default OfflineChatPage
