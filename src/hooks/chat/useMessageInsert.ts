import { supabase } from "@/integrations/supabase/client"
import { logger } from "./utils/logger"
import { ChatError } from "./utils/ChatError"
import { retryOperation } from "./utils/retryOperation"
import { ChatMessage } from "@/types/chat"

export const useMessageInsert = (userId: string | null) => {
  const insertMessage = async (
    message: string,
    conversationId: string,
    messageType: 'user' | 'assistant',
    conversationTitle?: string,
    attachments?: ChatMessage['attachments']
  ) => {
    return retryOperation(async () => {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          message,
          user_id: userId,
          conversation_id: conversationId,
          message_type: messageType,
          conversation_title: conversationTitle,
          attachments
        })
        .select()

      if (error) {
        logger.error("Error inserting message:", error)
        throw new ChatError("Failed to insert message", {
          conversationId,
          messageType,
          error
        })
      }

      return data
    })
  }

  return { insertMessage }
}