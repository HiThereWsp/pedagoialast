import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { ChatMessage } from "@/types/chat"
import { logger } from "./utils/logger"
import { ChatError } from "./utils/ChatError"

export const useMessageLoad = () => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [conversationContext, setConversationContext] = useState("")

  const loadConversationMessages = async (conversationId: string) => {
    logger.debug(`Loading messages for conversation: ${conversationId}`)
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chats')
        .select('*')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (messagesError) {
        logger.error("Error loading messages:", messagesError)
        throw new ChatError("Failed to load messages", { conversationId, error: messagesError })
      }

      if (messagesData) {
        logger.debug(`Messages loaded successfully: ${messagesData.length}`)
        const formattedMessages = messagesData.map(msg => ({
          role: msg.message_type as 'user' | 'assistant',
          content: msg.message,
          attachments: msg.attachments as ChatMessage['attachments']
        }))
        setMessages(formattedMessages)
        
        const context = formattedMessages
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n')
        setConversationContext(context)
        logger.debug("Conversation context updated")
      }
    } catch (error) {
      logger.error("Error in loadConversationMessages:", error)
      throw error
    }
  }

  return {
    messages,
    setMessages,
    loadConversationMessages,
    conversationContext
  }
}