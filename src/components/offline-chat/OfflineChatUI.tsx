
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tiles } from "@/components/ui/tiles"
import { Send } from "lucide-react"
import { useState } from "react"
import { ChatMessage } from "@/types/chat"

export const OfflineChatUI = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis Élia, votre assistant pédagogique local (sans connexion internet requise). Comment puis-je vous aider aujourd'hui ?"
    }
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue("")
  }

  return (
    <div className="relative h-screen flex flex-col">
      <div className="absolute inset-0 opacity-5">
        <Tiles rows={50} cols={8} tileSize="md" />
      </div>

      <Card className="relative flex-1 bg-background/95 backdrop-blur-sm border-muted shadow-lg rounded-lg overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 shadow-sm transition-all duration-200 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-muted/80 backdrop-blur-sm text-muted-foreground mr-4'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="relative p-4 flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Tapez votre message ici..."
          className="flex-1 bg-background/95 backdrop-blur-sm border-muted shadow-md"
        />
        <Button 
          type="submit" 
          size="icon"
          className="bg-primary hover:bg-primary/90 shadow-md transition-all duration-200"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
