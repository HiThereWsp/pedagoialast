import { useState } from "react"
import { ChatHistory } from "@/components/ChatHistory"
import { ChatInput } from "@/components/ChatInput"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface PdfChatProps {
  documentId: string
  title: string
}

export const PdfChat = ({ documentId, title }: PdfChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    try {
      setIsLoading(true)
      
      // Add user message to chat
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
      }
      
      setMessages(prev => [...prev, userMessage])

      // Call the edge function to get response based on PDF content
      const { data, error } = await supabase.functions.invoke('chat-with-pdf', {
        body: { 
          message,
          documentId
        }
      })

      if (error) throw error

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error in PDF chat:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="bg-white shadow-sm border-b px-4 py-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Discussion avec : {title}
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ChatHistory messages={messages} isLoading={isLoading} />
      </div>

      <div className="mt-auto">
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}