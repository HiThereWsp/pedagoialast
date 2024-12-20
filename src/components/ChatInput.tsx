import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal } from "lucide-react"
import { KeyboardEvent, useState, useEffect } from "react"

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>
  isLoading?: boolean
  value?: string
  onChange?: (value: string) => void
}

export const ChatInput = ({ onSendMessage, isLoading, value, onChange }: ChatInputProps) => {
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (value !== undefined) {
      setMessage(value)
    }
  }, [value])

  const handleSubmit = async () => {
    if (!message.trim() || isLoading) return
    
    const currentMessage = message
    setMessage("")
    if (onChange) {
      onChange("")
    }
    await onSendMessage(currentMessage)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (value: string) => {
    setMessage(value)
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <div className="flex items-end gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-premium">
      <Textarea
        value={message}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Écrivez votre message ici..."
        className="min-h-[80px] bg-white/50 backdrop-blur-sm"
      />
      <Button
        onClick={handleSubmit}
        disabled={!message.trim() || isLoading}
        className="mb-2 premium-button text-foreground"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}