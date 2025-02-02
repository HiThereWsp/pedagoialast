import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import { chatService } from "@/services/chatService"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

export const useMessageManagement = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const messagesData = await chatService.getMessages(conversationId);
      if (messagesData) {
        const formattedMessages = messagesData.map((msg: any) => ({
          role: msg.message_type as 'user' | 'assistant',
          content: msg.message,
          attachments: msg.attachments as ChatMessage['attachments']
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error in loadConversationMessages:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les messages."
      });
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
    if ((!message.trim() && (!attachments || attachments.length === 0)) || isLoading || !userId) return;

    setIsLoading(true);
    try {
      // Store user message
      await chatService.sendMessage(message, userId, conversationId);
      
      console.log("Calling OpenAI edge function with message:", message);
      
      // Get AI response from edge function
      const { data: aiResponseData, error: aiError } = await supabase.functions.invoke('chat-with-openai', {
        body: { 
          message,
          context,
          type: 'chat'
        }
      });

      if (aiError) {
        console.error("Error from edge function:", aiError);
        throw aiError;
      }

      console.log("Received AI response:", aiResponseData);

      // Store AI response
      if (aiResponseData?.response) {
        await chatService.sendMessage(
          aiResponseData.response,
          userId,
          conversationId,
          'assistant'
        );
      }

      // Reload messages to show the new conversation
      await loadConversationMessages(conversationId);
      
      return aiResponseData?.response;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message."
      });
    } finally {
      setIsLoading(false);
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