import { useState } from "react"
import { Send, Globe } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ChatInputProps {
  onSendMessage: (message: string, useWebSearch?: boolean) => Promise<void>
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
  const [useWebSearch, setUseWebSearch] = useState(false)
  const isMobile = useIsMobile()
  const { toast } = useToast()

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (message.trim() === "") return
    
    try {
      await onSendMessage(message, useWebSearch)
      setMessage("")
      if (onChange) {
        onChange("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message",
      })
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
      <div className="max-w-[700px] mx-auto">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2">
            <Switch
              id="web-search"
              checked={useWebSearch}
              onCheckedChange={setUseWebSearch}
            />
            <Label htmlFor="web-search" className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              Recherche web avancée
            </Label>
          </div>
          
          <form 
            onSubmit={handleSubmit}
            className="relative flex items-center w-full bg-white rounded-xl border border-gray-200 shadow-sm"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Saisissez votre message ici"
              className="w-full px-4 py-3 rounded-xl focus:outline-none disabled:opacity-50"
              disabled={isLoading}
            />
            
            <div className="px-3">
              <button
                type="submit"
                disabled={message.trim() === "" || isLoading}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Envoyer le message"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
          
          <div className="mt-2 text-xs text-gray-400 text-center px-4">
            En activant la recherche avancée, obtenez des réponses en temps réel et accédez à l'actualité du monde entier
          </div>
        </div>
      </div>
    </div>
  )
}