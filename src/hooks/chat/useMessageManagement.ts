import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"
import { useMessageInsert } from "./useMessageInsert"
import { useMessageLoad } from "./useMessageLoad"
import { logger } from "./utils/logger"

export const useMessageManagement = (userId: string | null) => {
  const [isLoading, setIsLoading] = useState(false)
  const { insertMessage } = useMessageInsert(userId)
  const { 
    messages, 
    setMessages, 
    loadConversationMessages, 
    conversationContext 
  } = useMessageLoad()

  const sendMessage = async (
    message: string,
    conversationId: string,
    conversationTitle: string | undefined,
    context: string,
    attachments?: ChatMessage['attachments'],
    useWebSearch?: boolean
  ) => {
    if (!userId) {
      logger.error("No user ID provided")
      return
    }

    logger.debug(`Sending message: ${message.substring(0, 50)}...`)
    if ((!message.trim() && (!attachments || attachments.length === 0)) || isLoading) {
      logger.debug("Message send cancelled", { 
        emptyMessage: !message.trim(), 
        noAttachments: !attachments || attachments.length === 0,
        isLoading
      })
      return
    }

    setIsLoading(true)
    const userMessage = message.trim()

    try {
      await insertMessage(
        userMessage,
        conversationId,
        'user',
        conversationTitle,
        attachments
      )

      let functionName = useWebSearch ? 'web-search' : 'chat-with-anthropic'
      logger.debug(`Calling edge function: ${functionName}`)
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          message: userMessage, 
          context: conversationContext,
          attachments: attachments?.map(a => ({
            url: a.url,
            fileName: a.fileName,
            type: a.fileType
          }))
        }
      })

      if (error) {
        logger.error("Error from edge function:", error)
        throw error
      }

      const aiResponse = data.response
      logger.debug("AI response received")

      await insertMessage(
        aiResponse,
        conversationId,
        'assistant',
        conversationTitle
      )

      await loadConversationMessages(conversationId)

      return aiResponse
    } catch (error) {
      logger.error("Error in sendMessage:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    setMessages,
    isLoading,
    loadConversationMessages,
    sendMessage,
    conversationContext
  }
}