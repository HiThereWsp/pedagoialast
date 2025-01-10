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
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100/20">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-end gap-4 bg-gradient-to-r from-[#FFDEE2]/20 to-[#FEF7CD]/20 p-4 rounded-2xl border border-[#FFDEE2]/30 shadow-premium hover:shadow-premium-lg transition-all duration-300">
          <Textarea
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message ici..."
            className="min-h-[60px] max-h-[200px] resize-none flex-1 bg-white/50 border-none focus-visible:ring-0 shadow-inner"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSubmit}
            disabled={message.trim() === "" || isLoading}
            size="icon"
            className="shrink-0 bg-[#FFDEE2] hover:bg-[#FFDEE2]/80 text-gray-700 shadow-premium hover:shadow-premium-lg transition-all duration-300"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}