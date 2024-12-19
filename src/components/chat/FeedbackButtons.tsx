import { useState } from "react"
import { ThumbsDown, Heart, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface FeedbackButtonsProps {
  messageId: number
  content: string
}

export const FeedbackButtons = ({ messageId, content }: FeedbackButtonsProps) => {
  const { toast } = useToast()
  const [feedbackScore, setFeedbackScore] = useState<1 | -1 | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  const handleFeedback = async (type: 'like' | 'dislike') => {
    const score = type === 'like' ? 1 : -1
    
    try {
      setFeedbackScore(score)

      const { error } = await supabase
        .from('chats')
        .update({ feedback_score: score })
        .eq('id', messageId)

      if (error) throw error

      toast({
        description: type === 'like' ? "Merci pour votre retour positif !" : "Merci pour votre retour",
      })
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du feedback:', err)
      setFeedbackScore(null)
      toast({
        variant: "destructive",
        description: "Erreur lors de l'enregistrement de votre retour",
      })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      toast({
        description: "Message copié dans le presse-papier",
        duration: 2000,
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie du message",
      })
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        onClick={() => handleFeedback('like')}
        className={cn(
          "rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-emerald-500",
          feedbackScore === 1 && "text-emerald-500"
        )}
        aria-label="J'aime"
      >
        <Heart className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleFeedback('dislike')}
        className={cn(
          "rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500",
          feedbackScore === -1 && "text-red-500"
        )}
        aria-label="Je n'aime pas"
      >
        <ThumbsDown className="h-4 w-4" />
      </button>
      <button
        onClick={handleCopy}
        className={cn(
          "rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-500",
          isCopied && "text-blue-500"
        )}
        aria-label="Copier le message"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  )
}