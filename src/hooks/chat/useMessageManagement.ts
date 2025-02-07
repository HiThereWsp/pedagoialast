
import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import { chatService } from "@/services/chatService"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const useMessageManagement = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadConversationMessages = async (conversationId: string) => {
    try {
      console.log('[useMessageManagement] Loading messages for conversation:', conversationId)
      const messagesData = await chatService.getMessages(conversationId)
      
      if (messagesData) {
        console.log('[useMessageManagement] Raw messages from DB:', messagesData)
        const formattedMessages = messagesData.map((msg: any) => {
          console.log('[useMessageManagement] Processing message:', msg)
          return {
            role: msg.message_type as 'user' | 'assistant',
            content: msg.message || '',
            attachments: Array.isArray(msg.attachments) ? msg.attachments.map((attachment: any) => ({
              url: attachment.url || '',
              fileName: attachment.fileName || '',
              fileType: attachment.fileType || '',
              filePath: attachment.filePath || ''
            })) : [],
            isWebSearch: false
          }
        })
        console.log('[useMessageManagement] Formatted messages:', formattedMessages)
        setMessages(formattedMessages)
      } else {
        console.log('[useMessageManagement] No messages found for conversation:', conversationId)
        setMessages([])
      }
    } catch (error) {
      console.error("[useMessageManagement] Error in loadConversationMessages:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages."
      })
    }
  }

  const sendMessage = async (
    message: string,
    conversationId: string,
    conversationTitle: string | undefined,
    context: string,
    attachments?: ChatMessage['attachments'],
    useWebSearch?: boolean
  ) => {
    if ((!message.trim() && (!attachments || attachments.length === 0)) || isLoading || !userId) {
      console.log("[useMessageManagement] Message send blocked:", { message, attachments, isLoading, userId })
      return
    }

    setIsLoading(true)
    try {
      console.log("[useMessageManagement] Storing user message:", { message, conversationId, userId })
      await chatService.sendMessage(message, userId, conversationId)
      
      console.log("[useMessageManagement] Calling OpenAI edge function with message:", message)
      const { data: aiResponseData, error: aiError } = await supabase.functions.invoke('chat-with-openai', {
        body: { 
          message,
          context,
          type: 'chat'
        }
      })

      if (aiError) {
        console.error("[useMessageManagement] Error from edge function:", aiError)
        throw aiError
      }

      console.log("[useMessageManagement] Received AI response:", aiResponseData)

      if (aiResponseData?.response) {
        console.log("[useMessageManagement] Storing AI response")
        await chatService.sendMessage(
          aiResponseData.response,
          userId,
          conversationId,
          'assistant'
        )
      } else {
        console.error("[useMessageManagement] No response data from AI")
      }

      console.log("[useMessageManagement] Reloading messages")
      await loadConversationMessages(conversationId)
      
      return aiResponseData?.response
    } catch (error) {
      console.error("[useMessageManagement] Error in sendMessage:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    setMessages,
    isLoading,
    loadConversationMessages,
    sendMessage
  }
}
