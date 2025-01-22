import { useEffect } from "react"
import { useConversationContext } from "./chat/useConversationContext"
import { useConversationManagement } from "./chat/useConversationManagement"
import { useMessageManagement } from "./chat/useMessageManagement"

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
      loadConversations()
    }
  }, [userId])

  const handleLoadConversationMessages = async (conversationId: string) => {
    await loadConversationMessages(conversationId)
    await loadContext(conversationId)
    setCurrentConversationId(conversationId)
  }

  const handleSendMessage = async (message: string, useWebSearch?: boolean) => {
    if (!message.trim() || isLoading || !userId) return

    try {
      let currentId = currentConversationId
      let title: string | undefined

      if (!currentId) {
        const newConversation = await createNewConversation(message)
        currentId = newConversation.conversationId
        title = newConversation.title
        setCurrentConversationId(currentId)
        setMessages([])
      }

      const aiResponse = await sendMessage(message, currentId, title, conversationContext, undefined, useWebSearch)
      
      if (aiResponse) {
        await updateContext(currentId, message, aiResponse)
      }

      await loadConversationMessages(currentId)
      await loadConversations()
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversation(conversationId)
    if (currentConversationId === conversationId) {
      setMessages([])
      clearContext()
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