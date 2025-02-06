
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, User } from "lucide-react"
import { useState } from "react"

export const OfflineChatUI = () => {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // La logique sera implémentée plus tard
    setInputValue("")
  }

  return (
    <div className="flex flex-col h-[80vh] space-y-4">
      <Card className="flex-1 p-4 bg-gradient-to-r from-[#FEF7CD]/60 to-[#FFDEE2]/60">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {/* Message de bienvenue */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-700">
                  Bonjour ! Je suis votre assistant pédagogique hors-ligne. 
                  Comment puis-je vous aider aujourd'hui ?
                </p>
              </div>
            </div>

            {/* Exemple de message utilisateur */}
            <div className="flex items-start gap-3 justify-end">
              <div className="flex-1 bg-primary rounded-lg p-4 shadow-sm">
                <p className="text-primary-foreground">
                  Je souhaite créer une séquence pédagogique.
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Tapez votre message ici..."
          className="flex-1"
        />
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
}
