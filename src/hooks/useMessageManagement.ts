import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"

export const useMessageManagement = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadConversationMessages = async (conversationId: string) => {
    console.log("Loading messages for conversation:", conversationId)
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chats')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error("Error loading messages:", messagesError)
        return
      }

      if (messagesData) {
        console.log("Messages loaded successfully:", messagesData.length)
        const formattedMessages = messagesData.map(msg => ({
          role: msg.message_type as 'user' | 'assistant',
          content: msg.message,
          attachments: msg.attachments as ChatMessage['attachments']
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
    conversationTitle?: string,
    context?: string,
    attachments?: ChatMessage['attachments'],
    useWebSearch?: boolean
  ) => {
    if (!userId) {
      console.error("No user ID provided")
      return
    }

    console.log("Sending message:", { message, conversationId, useWebSearch })
    setIsLoading(true)

    try {
      // Insert user message
      const { error: userMessageError } = await supabase
        .from('chats')
        .insert({
          message,
          user_id: userId,
          message_type: 'user',
          conversation_id: conversationId,
          conversation_title: conversationTitle,
          attachments
        })

      if (userMessageError) {
        console.error('Error inserting user message:', userMessageError)
        throw userMessageError
      }

      // Call appropriate edge function
      const functionName = useWebSearch ? 'web-search' : 'chat-with-anthropic'
      console.log("Calling edge function:", functionName)
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          message, 
          context,
          attachments: attachments?.map(a => ({
            url: a.url,
            fileName: a.fileName,
            type: a.fileType
          }))
        }
      })

      if (error) {
        console.error("Error from edge function:", error)
        throw error
      }

      const aiResponse = data.response

      // Insert AI response
      const { error: aiMessageError } = await supabase
        .from('chats')
        .insert({
          message: aiResponse,
          user_id: userId,
          message_type: 'assistant',
          conversation_id: conversationId,
          conversation_title: conversationTitle
        })

      if (aiMessageError) {
        console.error("Error inserting AI response:", aiMessageError)
        throw aiMessageError
      }

      await loadConversationMessages(conversationId)
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