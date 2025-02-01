import { supabase } from "@/integrations/supabase/client"
import { ChatMessage } from "@/types/chat"

export const chatService = {
  async checkExistingMessage(
    conversationId: string,
    message: string,
    userId: string
  ) {
    const { data, error } = await supabase
      .from('chats')
      .select('id')
      .match({
        conversation_id: conversationId,
        message,
        user_id: userId,
        message_type: 'user'
      })
      .maybeSingle()

    if (error) {
      console.error("Error checking for existing message:", error)
      throw error
    }

    return data
  },

  async insertUserMessage(
    message: string,
    userId: string,
    conversationId: string,
    conversationTitle?: string,
    attachments?: ChatMessage['attachments']
  ) {
    const { error } = await supabase
      .from('chats')
      .insert({
        message,
        user_id: userId,
        message_type: 'user',
        conversation_id: conversationId,
        conversation_title: conversationTitle,
        attachments
      })

    if (error) {
      console.error("Error inserting user message:", error)
      throw error
    }
  },

  async insertAIResponse(
    response: string,
    userId: string,
    conversationId: string,
    conversationTitle?: string
  ) {
    const { error } = await supabase
      .from('chats')
      .insert({
        message: response,
        user_id: userId,
        message_type: 'assistant',
        conversation_id: conversationId,
        conversation_title: conversationTitle
      })

    if (error) {
      console.error("Error inserting AI response:", error)
      throw error
    }
  }
}