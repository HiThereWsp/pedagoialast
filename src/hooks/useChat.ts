
import { useEffect } from "react"
import { useConversationContext } from "./chat/useConversationContext"
import { useConversationManagement } from "./chat/useConversationManagement"
import { useMessageManagement } from "./chat/useMessageManagement"
import { ChatMessage } from "@/types/chat"

export const useChat = (userId: string | null) => {
  const {
    conversationContext,
    updateContext,
    loadContext,
    clearContext
  } = useConversationContext(userId)

  const {
    conversations,
    currentConversationId,
    setCurrentConversationId,
    loadConversations,
    createNewConversation,
    deleteConversation
  } = useConversationManagement(userId)

  const {
    messages,
    setMessages,
    isLoading,
    loadConversationMessages,
    sendMessage
  } = useMessageManagement(userId)

  useEffect(() => {
    if (userId) {
      console.log("[useChat] Loading conversations for user:", userId)
      loadConversations()
    }
  }, [userId])

  const handleLoadConversationMessages = async (conversationId: string) => {
    console.log("[useChat] Loading messages for conversation:", conversationId)
    await loadConversationMessages(conversationId)
    await loadContext(conversationId)
    setCurrentConversationId(conversationId)
  }

  const handleSendMessage = async (message: string, useWebSearch?: boolean) => {
    if (!message.trim() || isLoading || !userId) {
      console.log("[useChat] Message send blocked:", { message, isLoading, userId })
      return
    }

    try {
      console.log("[useChat] Starting to send message:", message)
      setMessages(prev => {
        console.log("[useChat] Previous messages:", prev)
        const newMessages: ChatMessage[] = [...prev, { 
          role: 'user' as const, 
          content: message,
          attachments: [],
          isWebSearch: false
        }]
        console.log("[useChat] Updated messages:", newMessages)
        return newMessages
      })
      
      let currentId = currentConversationId
      let title: string | undefined

      if (!currentId) {
        console.log("[useChat] Creating new conversation")
        const newConversation = await createNewConversation(message)
        currentId = newConversation.conversationId
        title = newConversation.title
        console.log("[useChat] New conversation created:", { currentId, title })
        setCurrentConversationId(currentId)
      }

      if (!currentId) {
        console.error("[useChat] Failed to create or get conversation ID")
        return
      }

      console.log("[useChat] Sending message to AI")
      const aiResponse = await sendMessage(message, currentId, title, conversationContext, undefined, useWebSearch)
      
      if (aiResponse) {
        console.log("[useChat] Received AI response:", aiResponse)
        await updateContext(currentId, message, aiResponse)
        await loadConversationMessages(currentId)
        await loadConversations()
      } else {
        console.error("[useChat] No AI response received")
      }
    } catch (error) {
      console.error("[useChat] Error in handleSendMessage:", error)
      throw error
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    console.log("[useChat] Deleting conversation:", conversationId)
    await deleteConversation(conversationId)
    if (currentConversationId === conversationId) {
      setMessages([])
      clearContext()
      setCurrentConversationId(null)
    }
  }

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage: handleSendMessage,
    conversations,
    loadConversationMessages: handleLoadConversationMessages,
    currentConversationId,
    deleteConversation: handleDeleteConversation
  }
}
