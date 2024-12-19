import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>
  isLoading: boolean
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    await onSendMessage(message)
    setMessage("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-full">
      <Input 
        placeholder="Comment puis-je vous aider ?" 
        className="flex-1"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        size="icon"
        className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  )
}