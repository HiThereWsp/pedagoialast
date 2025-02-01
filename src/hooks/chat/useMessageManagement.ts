import { useState } from "react"
import { ChatMessage } from "@/types/chat"
import { chatService } from "@/services/chatService"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface SendMessageParams {
  message: string
  conversationId: string
  conversationTitle?: string
  context: string
  attachments?: ChatMessage['attachments']
  useWebSearch?: boolean
}

export const useMessageManagement = (userId: string | null) => {
  const [messages, setMessages] = useState<Array<ChatMessage>>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('chats')
        .select('*')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (messagesData) {
        const formattedMessages = messagesData.map((msg) => ({
          role: msg.message_type as 'user' | 'assistant',
          content: msg.message,
          attachments: msg.attachments as ChatMessage['attachments'],
          isWebSearch: msg.action_type === 'web_search'
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
    if (!userId || (!message.trim() && (!attachments || attachments.length === 0))) return;

    setIsLoading(true);
    try {
      // Vérification des messages similaires récents
      const recentTimeWindow = new Date(Date.now() - 30 * 1000).toISOString();
      const { data: existingMessage, error: checkError } = await supabase
        .from('chats')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .eq('message', message)
        .gt('created_at', recentTimeWindow)
        .is('deleted_at', null)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing message:', checkError);
        throw checkError;
      }

      if (!existingMessage) {
        const { error: insertError } = await supabase
          .from('chats')
          .insert({
            message,
            user_id: userId,
            conversation_id: conversationId,
            conversation_title: conversationTitle,
            message_type: 'user',
            action_type: useWebSearch ? 'web_search' : null,
            attachments,
            created_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      await loadConversationMessages(conversationId);
      
      // Simuler une réponse de l'assistant pour l'exemple
      const aiResponse = "Ceci est une réponse simulée de l'assistant.";
      
      return aiResponse;
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