import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"

export const useMessageManagement = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationContext, setConversationContext] = useState("")

  const loadConversationMessages = async (conversationId: string) => {
    console.log("Loading messages for conversation:", conversationId)
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
        console.log("Messages loaded successfully:", messagesData.length)
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
        console.log("Conversation context updated")
      }
    } catch (error) {
      console.error("Error in loadConversationMessages:", error)
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
    if (!userId) {
      console.error("No user ID provided")
      return
    }

    console.log("Sending message:", { message, conversationId, useWebSearch })
    if ((!message.trim() && (!attachments || attachments.length === 0)) || isLoading) {
      console.log("Message send cancelled:", { 
        emptyMessage: !message.trim(), 
        noAttachments: !attachments || attachments.length === 0,
        isLoading
      })
      return
    }

    setIsLoading(true)
    const userMessage = message.trim()

    try {
      // Vérifier d'abord si le message existe déjà
      console.log("Checking for existing message...")
      const { data: existingMessage } = await supabase
        .from('chats')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .eq('message', userMessage)
        .eq('message_type', 'user')
        .maybeSingle()

      if (existingMessage) {
        console.log("Message already exists, skipping insert")
      } else {
        console.log("Message doesn't exist, proceeding with insert")
        const { error: insertError } = await supabase
          .from('chats')
          .insert({
            message: userMessage,
            user_id: userId,
            conversation_id: conversationId,
            message_type: 'user',
            conversation_title: conversationTitle,
            attachments
          })

        if (insertError) {
          console.error("Error inserting user message:", insertError)
          throw insertError
        }
      }

      // Appeler l'edge function appropriée
      let functionName = useWebSearch ? 'web-search' : 'chat-with-anthropic'
      console.log("Calling edge function:", functionName)
      
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
        console.error("Error from edge function:", error)
        throw error
      }

      const aiResponse = data.response
      console.log("AI response received, inserting to database")

      // Vérifier si la réponse AI existe déjà
      const { data: existingAIResponse } = await supabase
        .from('chats')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .eq('message', aiResponse)
        .eq('message_type', 'assistant')
        .maybeSingle()

      if (existingAIResponse) {
        console.log("AI response already exists, skipping insert")
      } else {
        console.log("AI response doesn't exist, proceeding with insert")
        const { error: aiInsertError } = await supabase
          .from('chats')
          .insert({
            message: aiResponse,
            user_id: userId,
            conversation_id: conversationId,
            message_type: 'assistant',
            conversation_title: conversationTitle
          })

        if (aiInsertError) {
          console.error("Error inserting AI response:", aiInsertError)
          throw aiInsertError
        }
      }

      const updatedContext = conversationContext + 
        `\nUser: ${userMessage}\nAssistant: ${aiResponse}`
      setConversationContext(updatedContext)
      console.log("Conversation context updated")

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
    sendMessage,
    conversationContext
  }
}