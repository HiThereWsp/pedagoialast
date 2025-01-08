import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>
  isLoading?: boolean
  value?: string
  onChange?: (value: string) => void
}

export const ChatInput = ({
  onSendMessage,
  isLoading = false,
  value,
  onChange,
}: ChatInputProps) => {
  const [message, setMessage] = useState(value || "")
  const isMobile = useIsMobile()

  const handleSubmit = async () => {
    if (message.trim() === "") return
    
    try {
      await onSendMessage(message)
      setMessage("")
      if (onChange) {
        onChange("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleChange = (value: string) => {
    setMessage(value)
    if (onChange) {
      onChange(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={`flex items-end gap-4 bg-gradient-to-r from-[#FEF7CD]/10 to-[#FFDEE2]/10 p-4 rounded-lg backdrop-blur-sm border border-[#FEF7CD]/20 mx-4 ${isMobile ? 'w-[calc(100%-2rem)]' : 'max-w-[calc(100%-280px)] ml-auto'}`}>
      <Textarea
        value={message}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Écrivez votre message ici..."
        className="min-h-[100px] resize-none flex-1 bg-white/50"
        disabled={isLoading}
      />
      <Button 
        onClick={handleSubmit}
        disabled={message.trim() === "" || isLoading}
        size="icon"
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}