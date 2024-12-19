import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { ChatMessage } from "@/types/chat"

export const useChat = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !userId) return

    setIsLoading(true)
    const userMessage = message.trim()

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const { error: dbError } = await supabase
        .from('chats')
        .insert([
          { message: userMessage, user_id: userId, message_type: 'user' }
        ])

      if (dbError) throw dbError

      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: { message: userMessage }
      })

      if (error) throw error

      const aiResponse = data.response

      await supabase
        .from('chats')
        .insert([
          { 
            message: aiResponse, 
            user_id: userId,
            message_type: 'assistant'
          }
        ])

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    isLoading,
    sendMessage
  }
}