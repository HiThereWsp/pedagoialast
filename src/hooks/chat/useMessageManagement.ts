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
    console.log("Sending message:", { message, conversationId, useWebSearch })
    if ((!message.trim() && (!attachments || attachments.length === 0)) || isLoading || !userId) {
      console.log("Message send cancelled:", { 
        emptyMessage: !message.trim(), 
        noAttachments: !attachments || attachments.length === 0,
        isLoading,
        noUserId: !userId 
      })
      return
    }

    setIsLoading(true)
    const userMessage = message.trim()

    try {
      // 1. Vérifier si le message existe déjà
      console.log("Checking for existing message...")
      const { data: existingMessage, error: selectError } = await supabase
        .from('chats')
        .select('id')
        .match({
          conversation_id: conversationId,
          message: userMessage,
          user_id: userId,
          message_type: 'user'
        })
        .maybeSingle()

      if (selectError) {
        console.error("Error checking for existing message:", selectError)
        throw selectError
      }

      // 2. Si le message n'existe pas, l'insérer
      if (!existingMessage) {
        console.log("Message doesn't exist, inserting new message...")
        const { error: insertError } = await supabase
          .from('chats')
          .insert({
            message: userMessage,
            user_id: userId,
            message_type: 'user',
            conversation_id: conversationId,
            conversation_title: conversationTitle,
            attachments
          })

        if (insertError) {
          console.error("Error inserting user message:", insertError)
          throw insertError
        }
      } else {
        console.log("Message already exists, skipping insertion")
      }

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

      const { error: aiInsertError } = await supabase
        .from('chats')
        .insert({
          message: aiResponse,
          user_id: userId,
          message_type: 'assistant',
          conversation_id: conversationId,
          conversation_title: conversationTitle
        })

      if (aiInsertError) {
        console.error("Error inserting AI response:", aiInsertError)
        throw aiInsertError
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