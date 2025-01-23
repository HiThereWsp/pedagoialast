import { useState } from "react"
import { ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface FeedbackButtonsProps {
  messageId: number
  content: string
}

export const FeedbackButtons = ({ messageId, content }: FeedbackButtonsProps) => {
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const handleFeedback = async (type: 'like' | 'dislike') => {
    const score = type === 'like' ? 1 : -1
    
    try {
      const { error } = await supabase
        .from('chats')
        .update({ feedback_score: score })
        .eq('id', messageId)

      if (error) throw error

      setFeedbackScore(score)
      
      toast({
        title: "Merci pour votre retour !",
        description: "Votre feedback nous aide à améliorer nos réponses.",
      })
    } catch (error) {
      console.error('Error saving feedback:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de votre feedback.",
      })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      
      toast({
        title: "Copié !",
        description: "Le message a été copié dans votre presse-papier.",
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la copie du message.",
      })
    }
  }

  return (
    <div className="flex items-center justify-end gap-1 mt-2">
      <button
        onClick={() => handleFeedback('like')}
        className={cn(
          "rounded p-1 text-gray-400 hover:text-gray-600 transition-colors",
          feedbackScore === 1 && "text-gray-600"
        )}
        aria-label="J'aime"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleFeedback('dislike')}
        className={cn(
          "rounded p-1 text-gray-400 hover:text-gray-600 transition-colors",
          feedbackScore === -1 && "text-gray-600"
        )}
        aria-label="Je n'aime pas"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
      <button
        onClick={handleCopy}
        className={cn(
          "rounded p-1 text-gray-400 hover:text-gray-600 transition-colors",
          isCopied && "text-gray-600"
        )}
        aria-label="Copier le message"
      >
        {isCopied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}