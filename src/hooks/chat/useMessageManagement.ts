import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"

export const useMessageManagement = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadConversationMessages = async (conversationId: string) => {
    const { data: messagesData, error: messagesError } = await supabase
      .from('chats')
      .select('*')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error("Error loading messages:", messagesError)
      return
    }

    setMessages(messagesData.map(msg => ({
      role: msg.message_type as 'user' | 'assistant',
      content: msg.message
    })))
  }

  const sendMessage = async (
    message: string,
    conversationId: string,
    conversationTitle: string | undefined,
    context: string
  ) => {
    if (!message.trim() || isLoading || !userId) return

    setIsLoading(true)
    const userMessage = message.trim()

    try {
      // Add user message to UI
      setMessages(prev => [...prev, { role: 'user', content: userMessage }])

      // Save user message to database
      await supabase
        .from('chats')
        .insert([{
          message: userMessage,
          user_id: userId,
          message_type: 'user',
          conversation_id: conversationId,
          conversation_title: conversationTitle
        }])

      // Get AI response with embeddings
      const { data, error } = await supabase.functions.invoke('chat-with-embeddings', {
        body: { message: userMessage }
      })

      if (error) throw error

      const aiResponse = data.response

      // Save AI response to database
      await supabase
        .from('chats')
        .insert([{
          message: aiResponse,
          user_id: userId,
          message_type: 'assistant',
          conversation_id: conversationId
        }])

      // Add AI response to UI
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])

      return aiResponse
    } catch (error) {
      console.error("Error:", error)
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