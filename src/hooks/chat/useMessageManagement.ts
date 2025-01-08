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

      if (messagesData) {
        const formattedMessages = messagesData.map(msg => ({
          role: msg.message_type as 'user' | 'assistant',
          content: msg.message
        }))
        setMessages(formattedMessages)
      }
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
      const userChatMessage: ChatMessage = { role: 'user', content: userMessage }
      setMessages(prev => [...prev, userChatMessage])

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

      // Obtenir la réponse de l'IA avec recherche web
      const { data, error } = await supabase.functions.invoke('chat-with-web-search', {
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
      const aiChatMessage: ChatMessage = { role: 'assistant', content: aiResponse }
      setMessages(prev => [...prev, aiChatMessage])

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