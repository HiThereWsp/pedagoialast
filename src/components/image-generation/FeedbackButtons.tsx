import { useState } from 'react'
import { ThumbsDown, Heart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { FeedbackButton } from './buttons/FeedbackButton'
import { NegativeFeedback } from './buttons/NegativeFeedback'

interface FeedbackButtonsProps {
  imageUrl: string
}

export const FeedbackButtons = ({ imageUrl }: FeedbackButtonsProps) => {
  const { toast } = useToast()
  const [feedbackScore, setFeedbackScore] = useState<1 | -1 | null>(null)
  const [showNegativeFeedback, setShowNegativeFeedback] = useState(false)

  const handleFeedback = async (type: 'like' | 'dislike') => {
    const score = type === 'like' ? 1 : -1
    
    try {
      if (type === 'like') {
        setFeedbackScore(score)
        setShowNegativeFeedback(false)
        
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase
          .from('tool_metrics')
          .insert({
            user_id: user.id,
            tool_type: 'image_generation',
            action_type: 'generate',
            feedback_score: score
          })

        if (error) throw error

        toast({
          description: "Merci pour votre retour positif !",
        })
      } else {
        // Handle dislike button toggle
        if (feedbackScore === -1) {
          // If already disliked, turn it off
          setFeedbackScore(null)
          setShowNegativeFeedback(false)
        } else {
          // If not disliked, turn it on
          setFeedbackScore(-1)
          setShowNegativeFeedback(true)
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du feedback:', err)
      setFeedbackScore(null)
      toast({
        variant: "destructive",
        description: "Erreur lors de l'enregistrement de votre retour",
      })
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <FeedbackButton
          icon={Heart}
          isActive={feedbackScore === 1}
          onClick={() => handleFeedback('like')}
          label="J'aime"
        />
        <FeedbackButton
          icon={ThumbsDown}
          isActive={feedbackScore === -1}
          onClick={() => handleFeedback('dislike')}
          label="Je n'aime pas"
        />
      </div>

      <NegativeFeedback 
        imageUrl={imageUrl}
        isVisible={showNegativeFeedback}
      />
    </div>
  )
}