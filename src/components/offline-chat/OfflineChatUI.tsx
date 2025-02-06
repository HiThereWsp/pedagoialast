
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
      content: "Bonjour, comment puis-je t'aider ?"
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
      <div className="absolute inset-0 opacity-15 bg-gradient-to-br from-purple-50 to-blue-50">
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
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800'
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
          className="flex-1 bg-background/95 backdrop-blur-sm border-muted shadow-md focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
        />
        <Button 
          type="submit" 
          size="icon"
          className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-md transition-all duration-200"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
