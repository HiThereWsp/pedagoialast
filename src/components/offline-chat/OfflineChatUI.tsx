import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { useState } from "react"

export const OfflineChatUI = () => {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // La logique sera implémentée plus tard
    setInputValue("")
  }

  return (
    <div className="h-screen flex flex-col">
      <Card className="flex-1">
        <ScrollArea className="h-full p-4">
          <div>
            <div>
              <p>
                Bonjour ! Je suis votre assistant pédagogique hors-ligne. 
                Comment puis-je vous aider aujourd'hui ?
              </p>
            </div>
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
        <Button type="submit">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
