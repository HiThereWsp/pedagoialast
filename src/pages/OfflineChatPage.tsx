
import { SEO } from "@/components/SEO"
import { OfflineChatUI } from "@/components/offline-chat/OfflineChatUI"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

const OfflineChatPage = () => {
  const isMobile = useIsMobile()

  return (
    <>
      <SEO 
        title="Élia - L'assistant pédagogique - PedagoIA"
        description="Discutez avec Élia, votre assistant pédagogique, même sans connexion internet"
      />
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar 
            conversations={[]}
            onConversationSelect={() => {}}
            onDeleteConversation={() => {}}
            onLogout={() => {}}
          />
          <main className="flex-1">
            <div className="container mx-auto max-w-4xl h-[calc(100vh-80px)]">
              <OfflineChatUI />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  )
}

export default OfflineChatPage
