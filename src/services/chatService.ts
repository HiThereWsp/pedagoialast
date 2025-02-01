import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chat';

export const chatService = {
  async sendMessage(message: string, userId: string, conversationId: string | null) {
    try {
      // Vérifions d'abord si ce message existe déjà
      if (conversationId) {
        const { data: existingMessage } = await supabase
          .from('chats')
          .select('id')
          .eq('user_id', userId)
          .eq('conversation_id', conversationId)
          .eq('message', message)
          .maybeSingle();

        if (existingMessage) {
          console.log('Message already exists, skipping insertion');
          return existingMessage;
        }
      }

      // Si le message n'existe pas, on l'insère
      const { data, error } = await supabase
        .from('chats')
        .insert({
          message,
          user_id: userId,
          message_type: 'user',
          conversation_id: conversationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getMessages(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
};