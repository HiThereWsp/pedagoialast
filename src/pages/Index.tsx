import { useState } from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { SEO } from "@/components/SEO"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function Index() {
  const [conversations, setConversations] = useState<Array<{id: string, title: string}>>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setConversations([])
      setCurrentConversationId("")
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
      })
    }
  }

  const handleConversationSelect = async (conversationId: string) => {
    setCurrentConversationId(conversationId)
  }

  const handleNewConversation = () => {
    setCurrentConversationId("")
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      if (currentConversationId === conversationId) {
        setCurrentConversationId("")
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de la conversation.",
      })
    }
  }

  return (
    <>
      <SEO 
        title="PedagoIA - Assistant pédagogique intelligent"
        description="Discutez avec PedagoIA pour créer des contenus pédagogiques personnalisés et innovants."
      />
      <div className="flex h-screen">
        <AppSidebar
          conversations={conversations}
          onConversationSelect={handleConversationSelect}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {/* Vous pouvez ajouter ici un nouveau contenu pour remplacer le chat */}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
