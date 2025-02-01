import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import { supabase } from "@/integrations/supabase/client"

// Logger pour un meilleur suivi des opérations
const logger = {
  debug: (msg: string) => console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`),
  error: (msg: string, err: any) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err)
}

// Classe personnalisée pour la gestion des erreurs
class ChatError extends Error {
  constructor(message: string, public context: object) {
    super(message)
    this.name = 'ChatError'
  }
}

// Fonction de retry pour les opérations qui peuvent échouer
const retryOperation = async <T>(operation: () => Promise<T>, retries = 3): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return retryOperation(operation, retries - 1)
    }
    throw error
  }
}

export const useMessageManagement = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationContext, setConversationContext] = useState("")

  const loadConversationMessages = async (conversationId: string) => {
    logger.debug(`Loading messages for conversation: ${conversationId}`)
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chats')
        .select('*')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (messagesError) {
        logger.error("Error loading messages:", messagesError)
        throw new ChatError("Failed to load messages", { conversationId, error: messagesError })
      }

      if (messagesData) {
        logger.debug(`Messages loaded successfully: ${messagesData.length}`)
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
        logger.debug("Conversation context updated")
      }
    } catch (error) {
      logger.error("Error in loadConversationMessages:", error)
      throw error
    }
  }

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
        .onConflict('unique_chat_message')
        .merge()

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

  const sendMessage = async (
    message: string,
    conversationId: string,
    conversationTitle: string | undefined,
    context: string,
    attachments?: ChatMessage['attachments'],
    useWebSearch?: boolean
  ) => {
    if (!userId) {
      logger.error("No user ID provided")
      return
    }

    logger.debug(`Sending message: ${message.substring(0, 50)}...`)
    if ((!message.trim() && (!attachments || attachments.length === 0)) || isLoading) {
      logger.debug("Message send cancelled", { 
        emptyMessage: !message.trim(), 
        noAttachments: !attachments || attachments.length === 0,
        isLoading
      })
      return
    }

    setIsLoading(true)
    const userMessage = message.trim()

    try {
      // Insertion du message utilisateur
      await insertMessage(
        userMessage,
        conversationId,
        'user',
        conversationTitle,
        attachments
      )

      // Appel de l'edge function appropriée
      let functionName = useWebSearch ? 'web-search' : 'chat-with-anthropic'
      logger.debug(`Calling edge function: ${functionName}`)
      
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
        logger.error("Error from edge function:", error)
        throw error
      }

      const aiResponse = data.response
      logger.debug("AI response received")

      // Insertion de la réponse AI
      await insertMessage(
        aiResponse,
        conversationId,
        'assistant',
        conversationTitle
      )

      const updatedContext = conversationContext + 
        `\nUser: ${userMessage}\nAssistant: ${aiResponse}`
      setConversationContext(updatedContext)
      logger.debug("Conversation context updated")

      await loadConversationMessages(conversationId)

      return aiResponse
    } catch (error) {
      logger.error("Error in sendMessage:", error)
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