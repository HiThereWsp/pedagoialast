import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"

export const useMessageManagement = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadConversationMessages = async (conversationId: string) => {
    try {
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
    } catch (error) {
      console.error("Error in loadConversationMessages:", error)
    }
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
      // Ajouter le message utilisateur à l'UI
      setMessages(prev => [...prev, { role: 'user', content: userMessage }])

      // Sauvegarder le message utilisateur dans la base de données
      const { error: insertError } = await supabase
        .from('chats')
        .insert([{
          message: userMessage,
          user_id: userId,
          message_type: 'user',
          conversation_id: conversationId,
          conversation_title: conversationTitle
        }])

      if (insertError) {
        console.error("Error inserting user message:", insertError)
        throw insertError
      }

      // Obtenir la réponse de l'IA
      const { data, error } = await supabase.functions.invoke('chat-with-embeddings', {
        body: { message: userMessage, context }
      })

      if (error) throw error

      const aiResponse = data.response

      // Sauvegarder la réponse de l'IA dans la base de données
      const { error: aiInsertError } = await supabase
        .from('chats')
        .insert([{
          message: aiResponse,
          user_id: userId,
          message_type: 'assistant',
          conversation_id: conversationId,
          conversation_title: conversationTitle
        }])

      if (aiInsertError) {
        console.error("Error inserting AI response:", aiInsertError)
        throw aiInsertError
      }

      // Ajouter la réponse de l'IA à l'UI
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])

      return aiResponse
    } catch (error) {
      console.error("Error in sendMessage:", error)
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
    sendMessage
  }
}