
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';
import { Json } from '@/types/database/json';

export const chatService = {
  async sendMessage(
    message: string, 
    userId: string, 
    conversationId: string | null,
    messageType: 'user' | 'assistant' = 'user'
  ) {
    try {
      console.log('[chatService] Sending message:', {
        message,
        userId,
        conversationId,
        messageType
      });

      const messageData = {
        message,
        user_id: userId,
        conversation_id: conversationId,
        message_type: messageType,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('chats')
        .insert(messageData)
        .select();

      if (error) {
        console.error('[chatService] Error sending message:', error);
        throw error;
      }

      console.log('[chatService] Message sent successfully:', data[0]);
      return data[0];
    } catch (error) {
      console.error('[chatService] Error in sendMessage:', error);
      throw error;
    }
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      console.log('[chatService] Fetching messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[chatService] Error fetching messages:', error);
        throw error;
      }

      console.log('[chatService] Raw messages from DB:', data);

      if (!data || data.length === 0) {
        console.log('[chatService] No messages found');
        return [];
      }

      const formattedMessages: ChatMessage[] = data.map(msg => {
        const attachments = Array.isArray(msg.attachments) 
          ? msg.attachments.map((attachment: any) => ({
              url: attachment.url || '',
              fileName: attachment.fileName || '',
              fileType: attachment.fileType || '',
              filePath: attachment.filePath || ''
            }))
          : [];

        return {
          role: msg.message_type as 'user' | 'assistant',
          content: msg.message || '',
          attachments,
          isWebSearch: false,
          id: msg.id
        };
      });

      console.log('[chatService] Formatted messages:', formattedMessages);
      return formattedMessages;
    } catch (error) {
      console.error('[chatService] Error in getMessages:', error);
      throw error;
    }
  }
};
