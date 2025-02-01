import { useState } from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatInput } from "@/components/ChatInput"
import { ChatHistory } from "@/components/ChatHistory"
import { SEO } from "@/components/SEO"
import { EmptyState } from "@/components/chat/EmptyState"
import { useChatAuth } from "@/components/chat/ChatAuth"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ChatMessage } from "@/types/chat"

export default function NewChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { userId, firstName, isLoading: authLoading } = useChatAuth()

  const handleSendMessage = async (
    message: string, 
    attachments?: Array<{ url: string; fileName?: string; fileType?: string }>,
    useWebSearch?: boolean
  ) => {
    if (!message.trim() || isLoading) return

    try {
      setIsLoading(true)
      
      // Ajouter le message de l'utilisateur
      setMessages(prev => [...prev, {
        role: 'user',
        content: message,
        attachments
      }])

      // Simuler une réponse après un délai
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Je suis un assistant en cours de développement. Je ne peux pas encore répondre à vos messages, mais je serai bientôt opérationnel !",
        }])
        setIsLoading(false)
      }, 1000)

    } catch (error) {
      console.error('Error sending message:', error)
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <SEO 
        title="Nouveau Chat | PedagoIA - Assistant pédagogique intelligent"
        description="Discutez avec PedagoIA pour créer des contenus pédagogiques personnalisés et innovants."
      />
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar
            conversations={[]}
            onConversationSelect={() => {}}
            currentConversationId=""
            onNewConversation={() => {}}
            onDeleteConversation={() => {}}
            firstName={firstName}
            onLogout={() => {}}
          />
          <main className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col">
              {messages.length === 0 ? (
                <EmptyState firstName={firstName} />
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <ChatHistory messages={messages} isLoading={isLoading} />
                </div>
              )}
              <ChatInput 
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  )
}