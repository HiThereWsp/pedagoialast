import { useState } from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { useChat } from "@/hooks/useChat"
import { ChatInput } from "@/components/ChatInput"
import { ChatHistory } from "@/components/ChatHistory"
import { SEO } from "@/components/SEO"
import { EmptyState } from "@/components/chat/EmptyState"
import { useChatAuth } from "@/components/chat/ChatAuth"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { SidebarProvider } from "@/hooks/use-sidebar"

export default function Index() {
  const [conversations, setConversations] = useState<Array<{id: string, title: string}>>([])
  const [currentConversationId, setCurrentConversationId] = useState<string>("")
  const { userId, firstName, isLoading } = useChatAuth()
  const { toast } = useToast()

  const {
    messages,
    isLoading: chatLoading,
    sendMessage: originalSendMessage,
    conversations: chatConversations,
    loadConversationMessages,
    currentConversationId: activeChatId,
    deleteConversation
  } = useChat(userId)

  const handleSendMessage = async (
    message: string, 
    attachments?: Array<{ url: string; fileName?: string; fileType?: string }>,
    useWebSearch?: boolean
  ) => {
    await originalSendMessage(message, useWebSearch)
  }

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
    await loadConversationMessages(conversationId)
  }

  const handleNewConversation = () => {
    setCurrentConversationId("")
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId)
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const showEmptyState = !messages || messages.length === 0
  const isNewChat = !currentConversationId

  return (
    <>
      <SEO 
        title="Chat | PedagoIA - Assistant pédagogique intelligent"
        description="Discutez avec PedagoIA pour créer des contenus pédagogiques personnalisés et innovants."
      />
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full">
          <AppSidebar
            conversations={conversations}
            onConversationSelect={handleConversationSelect}
            currentConversationId={currentConversationId}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            firstName={firstName}
            onLogout={handleLogout}
          />
          <main className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col">
              {showEmptyState && isNewChat ? (
                <EmptyState firstName={firstName} />
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <ChatHistory messages={messages} isLoading={chatLoading} />
                </div>
              )}
              <ChatInput 
                onSendMessage={handleSendMessage}
                isLoading={chatLoading}
              />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  )
}