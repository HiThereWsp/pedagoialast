import { ChatMessage } from "@/types/chat"
import { cn } from "@/lib/utils"
import { Loader2, ThumbsDown, Heart, Copy } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from 'react-markdown'
import { supabase } from "@/integrations/supabase/client"

interface ChatHistoryProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export const ChatHistory = ({ messages, isLoading }: ChatHistoryProps) => {
  const { toast } = useToast()
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)
  const [feedbackStates, setFeedbackStates] = useState<Record<number, 1 | -1 | null>>({})

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedMessageId(index)
      toast({
        description: "Message copié dans le presse-papier",
        duration: 2000,
      })
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie du message",
      })
    }
  }

  const handleFeedback = async (messageId: number, type: 'like' | 'dislike') => {
    const feedbackScore = type === 'like' ? 1 : -1
    
    try {
      // Mettre à jour l'état local immédiatement pour un retour utilisateur instantané
      setFeedbackStates(prev => ({
        ...prev,
        [messageId]: feedbackScore
      }))

      // Mettre à jour le feedback dans la base de données
      const { error } = await supabase
        .from('chats')
        .update({ feedback_score: feedbackScore })
        .eq('id', messageId)

      if (error) throw error

      toast({
        description: type === 'like' ? "Merci pour votre retour positif !" : "Merci pour votre retour",
      })
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du feedback:', err)
      // Restaurer l'état précédent en cas d'erreur
      setFeedbackStates(prev => ({
        ...prev,
        [messageId]: null
      }))
      toast({
        variant: "destructive",
        description: "Erreur lors de l'enregistrement de votre retour",
      })
    }
  }

  const formatMessage = (content: string) => {
    return content
      .replace(/###/g, "")
      .replace(/\*\*/g, "**")  // Préserve les marqueurs de gras
      .trim()
  }

  return (
    <div className="mb-8 space-y-6">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={cn(
            "group relative rounded-lg p-4 transition-all",
            msg.role === 'user' 
              ? 'ml-auto max-w-[80%] bg-primary/10' 
              : 'mr-auto max-w-[80%] bg-white shadow-sm border border-gray-100'
          )}
        >
          <div className="text-foreground whitespace-pre-wrap leading-relaxed">
            <ReactMarkdown
              components={{
                strong: ({ children }) => <span className="font-bold">{children}</span>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>
              }}
            >
              {formatMessage(msg.content)}
            </ReactMarkdown>
          </div>

          {msg.role === 'assistant' && (
            <div className="mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => handleFeedback(index, 'like')}
                className={cn(
                  "rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-emerald-500",
                  feedbackStates[index] === 1 && "text-emerald-500"
                )}
                aria-label="J'aime"
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleFeedback(index, 'dislike')}
                className={cn(
                  "rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500",
                  feedbackStates[index] === -1 && "text-red-500"
                )}
                aria-label="Je n'aime pas"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleCopy(msg.content, index)}
                className={cn(
                  "rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-500",
                  copiedMessageId === index && "text-blue-500"
                )}
                aria-label="Copier le message"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-4 mr-auto max-w-[80%] flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <p className="text-muted-foreground">En train d'écrire...</p>
        </div>
      )}
    </div>
  )
}