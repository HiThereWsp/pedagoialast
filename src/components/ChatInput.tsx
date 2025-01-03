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
    <div className="flex items-end gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <Textarea
        value={message}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Écrivez votre message ici..."
        className="min-h-[80px] max-h-[200px] bg-transparent border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
      />
      <Button
        onClick={handleSubmit}
        disabled={!message.trim() || isLoading}
        className="mb-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      >
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}