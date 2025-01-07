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
    <div className="flex items-end gap-4 bg-gradient-to-r from-[#FEF7CD]/10 to-[#FFDEE2]/10 p-4 rounded-lg backdrop-blur-sm border border-[#FEF7CD]/20 max-w-[calc(100%-280px)] ml-auto mr-4">
      <Textarea
        value={message}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Écrivez votre message ici..."
        className="min-h-[80px] max-h-[200px] bg-white/80 border-[#FFDEE2]/20 focus-visible:ring-[#FFDEE2]/30 overflow-y-auto"
      />
      <Button
        onClick={handleSubmit}
        disabled={!message.trim() || isLoading}
        className="mb-2 bg-gradient-to-r from-[#FEF7CD] to-[#FFDEE2] text-gray-700 hover:from-[#FEF7CD]/90 hover:to-[#FFDEE2]/90 transition-all duration-300"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}