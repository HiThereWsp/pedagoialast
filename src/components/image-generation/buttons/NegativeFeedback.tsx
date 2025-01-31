import { useState } from 'react'
import { Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface NegativeFeedbackProps {
  imageUrl: string
  isVisible: boolean
}

export const NegativeFeedback = ({ imageUrl, isVisible }: NegativeFeedbackProps) => {
  const { toast } = useToast()
  const [comment, setComment] = useState('')

  const handleSubmit = async () => {
    if (!comment.trim()) return
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('tool_metrics')
        .insert({
          user_id: user.id,
          tool_type: 'image_generation',
          action_type: 'generate',
          feedback_score: -1,
          content_length: comment.length
        })

      if (error) throw error

      setComment('')
      toast({
        description: "Merci pour votre retour",
      })
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du commentaire:', err)
      toast({
        variant: "destructive",
        description: "Erreur lors de l'enregistrement de votre commentaire",
      })
    }
  }

  if (!isVisible) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Dites-nous pourquoi..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleSubmit}
          size="sm"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Envoyer</span>
        </Button>
      </div>
    </div>
  )
}