import { useState } from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { ChatInput } from "@/components/ChatInput"
import { ChatHistory } from "@/components/ChatHistory"
import { SEO } from "@/components/SEO"
import { EmptyState } from "@/components/chat/EmptyState"
import { useChatAuth } from "@/components/chat/ChatAuth"
import { useToast } from "@/hooks/use-toast"
import { AttachmentType, ChatMessage } from "@/types/chat"

export default function NewChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { userId, firstName, isLoading: authLoading } = useChatAuth()
  const { toast } = useToast()

  const handleSendMessage = async (
    message: string,
    attachments?: Array<AttachmentType>,
    useWebSearch?: boolean
  ) => {
    if (!message.trim() || isLoading) return

    try {
      setIsLoading(true)
      
      // Ajouter le message de l'utilisateur à l'historique
      setMessages(prev => [...prev, {
        role: 'user',
        content: message,
        attachments
      }])

      // Simuler une réponse après un délai
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Ceci est une réponse simulée. Pour implémenter la vraie logique, nous devrons connecter ce composant à un backend.",
        }])
        setIsLoading(false)
      }, 1000)

    } catch (error) {
      console.error('Error in handleSendMessage:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message.",
      })
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

  const showEmptyState = !messages || messages.length === 0

  return (
    <>
      <SEO 
        title="Nouveau Chat | PedagoIA - Assistant pédagogique intelligent"
        description="Discutez avec PedagoIA pour créer des contenus pédagogiques personnalisés et innovants."
      />
      <div className="flex h-screen">
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
            {showEmptyState ? (
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
    </>
  )
}