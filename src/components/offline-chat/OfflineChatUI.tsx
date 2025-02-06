
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { useState } from "react"
import { ChatMessage } from "@/types/chat"

export const OfflineChatUI = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis votre assistant pédagogique local (sans connexion internet requise). Comment puis-je vous aider aujourd'hui ?"
    }
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Ajouter le message de l'utilisateur
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue("")
  }

  return (
    <div className="h-screen flex flex-col">
      <Card className="flex-1 bg-background border-muted">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-muted text-muted-foreground mr-4'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="p-4 flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Tapez votre message ici..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
