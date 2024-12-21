import { supabase } from "@/integrations/supabase/client"

export const useTitleGeneration = () => {
  const generateTitle = async (message: string) => {
    const commonEnglishWords = /\b(the|is|are|was|were|have|has|had|been|will|would|could|should|may|might|must|can|a|an|and|or|but|in|on|at|to|for|of|with)\b/i
    const isEnglish = commonEnglishWords.test(message.toLowerCase())

    try {
      const prompt = isEnglish
        ? "Generate a very short and concise title (max 5 words) for a conversation that starts with this message: "
        : "Génère un titre très court et concis (maximum 5 mots) en français pour une conversation qui commence par ce message : "

      const { data, error } = await supabase.functions.invoke('chat-with-openai', {
        body: { 
          message: prompt + message,
          type: 'title-generation'
        }
      })

      if (error) throw error
      return data.response
    } catch (error) {
      console.error("Error generating title:", error)
      return isEnglish ? "New Conversation" : "Nouvelle conversation"
    }
  }

  return { generateTitle }
}