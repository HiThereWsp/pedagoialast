
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface FeedbackButtonsProps {
  messageId: number
  onFeedback?: (type: 'like' | 'dislike') => void
}

export function FeedbackButtons({ messageId, onFeedback }: FeedbackButtonsProps) {
  const [feedbackType, setFeedbackType] = useState<'like' | 'dislike' | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const handleFeedback = async (type: 'like' | 'dislike') => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ feedback_type: type })
        .eq('id', messageId)

      if (error) throw error

      setFeedbackType(type)
      onFeedback?.(type)

      toast({
        description: type === 'like' ? "Merci pour votre retour positif !" : "Merci pour votre retour.",
      })
    } catch (error) {
      console.error('Error updating feedback:', error)
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de l'enregistrement de votre retour.",
      })
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      toast({
        description: "Le message a été copié dans le presse-papier.",
      })

      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Error copying text:', error)
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la copie du message.",
      })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "text-gray-500 hover:text-green-500",
          feedbackType === 'like' && "text-green-500"
        )}
        onClick={() => handleFeedback('like')}
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="sr-only">J'aime</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "text-gray-500 hover:text-red-500",
          feedbackType === 'dislike' && "text-red-500"
        )}
        onClick={() => handleFeedback('dislike')}
      >
        <ThumbsDown className="h-4 w-4" />
        <span className="sr-only">Je n'aime pas</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "text-gray-500 hover:text-blue-500",
          isCopied && "text-blue-500"
        )}
        onClick={() => handleCopy('text')}
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copier</span>
      </Button>
    </div>
  )
}
