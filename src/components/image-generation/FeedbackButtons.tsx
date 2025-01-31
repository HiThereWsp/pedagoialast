import { useState } from 'react'
import { ThumbsDown, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface FeedbackButtonsProps {
  imageUrl: string
}

export const FeedbackButtons = ({ imageUrl }: FeedbackButtonsProps) => {
  const { toast } = useToast()
  const [feedbackScore, setFeedbackScore] = useState<1 | -1 | null>(null)
  const [showNegativeFeedback, setShowNegativeFeedback] = useState(false)
  const [negativeComment, setNegativeComment] = useState('')

  const handleFeedback = async (type: 'like' | 'dislike') => {
    const score = type === 'like' ? 1 : -1
    
    try {
      setFeedbackScore(score)
      if (type === 'dislike') {
        setShowNegativeFeedback(true)
      } else {
        setShowNegativeFeedback(false)
      }
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('tool_metrics')
        .insert({
          user_id: user.id,
          tool_type: 'image_generation',
          action_type: 'generate',
          feedback_score: score,
          content_length: negativeComment.length || 0
        })

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

  const handleNegativeSubmit = async () => {
    if (!negativeComment.trim()) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('tool_metrics')
        .update({ content_length: negativeComment.length })
        .eq('user_id', user.id)
        .eq('tool_type', 'image_generation')
        .eq('feedback_score', -1)
        .is('content_length', null)

      if (error) throw error

      setShowNegativeFeedback(false)
      toast({
        description: "Merci pour vos commentaires détaillés",
      })
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du commentaire:', err)
      toast({
        variant: "destructive",
        description: "Erreur lors de l'enregistrement de votre commentaire",
      })
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleFeedback('like')}
          className={cn(
            "rounded-full p-2 text-gray-400 hover:bg-[#E5DEFF] hover:text-[#9b87f5] transition-all duration-300 transform hover:scale-110",
            feedbackScore === 1 && "text-[#9b87f5] bg-[#E5DEFF]"
          )}
          aria-label="J'aime"
        >
          <Heart className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleFeedback('dislike')}
          className={cn(
            "rounded-full p-2 text-gray-400 hover:bg-[#E5DEFF] hover:text-[#6E59A5] transition-all duration-300 transform hover:scale-110",
            feedbackScore === -1 && "text-[#6E59A5] bg-[#E5DEFF]"
          )}
          aria-label="Je n'aime pas"
        >
          <ThumbsDown className="h-5 w-5" />
        </button>
      </div>

      {showNegativeFeedback && (
        <div className="mt-4 space-y-2">
          <Input
            placeholder="Dites-nous pourquoi..."
            value={negativeComment}
            onChange={(e) => setNegativeComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleNegativeSubmit()}
            className="w-full"
          />
        </div>
      )}
    </div>
  )
}