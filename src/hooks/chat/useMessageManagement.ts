import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"

export const useMessageManagement = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationContext, setConversationContext] = useState("")

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
          content: msg.message,
          attachments: msg.attachments
        }))
        setMessages(formattedMessages)
        
        const context = formattedMessages
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n')
        setConversationContext(context)
        console.log("Loaded conversation context:", context)
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
    if ((!message.trim() && (!attachments || attachments.length === 0)) || isLoading || !userId) return

    setIsLoading(true)
    const userMessage = message.trim()

    try {
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

      let functionName = useWebSearch ? 'web-search' : 'chat-with-openai'
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { 
          message: userMessage, 
          context: conversationContext,
          attachments: attachments?.map(a => ({
            url: a.url,
            fileName: a.fileName,
            fileType: a.fileType,
            filePath: a.filePath
          }))
        }
      })

      if (error) throw error

      const aiResponse = data.response

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
      console.log("Updated conversation context:", updatedContext)

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