import { ChatMessage } from "@/types/chat"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ChatHistoryProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export const ChatHistory = ({ messages, isLoading }: ChatHistoryProps) => {
  return (
    <div className="mb-8 space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={cn(
            "rounded-lg p-4",
            msg.role === 'user' 
              ? 'bg-primary/10 ml-auto max-w-[80%]' 
              : 'bg-muted mr-auto max-w-[80%]'
          )}
        >
          <p className="text-foreground whitespace-pre-wrap">{msg.content}</p>
        </div>
      ))}
      {isLoading && (
        <div className="bg-muted rounded-lg p-4 mr-auto max-w-[80%] flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-muted-foreground">En train d'écrire...</p>
        </div>
      )}
    </div>
  )
}