import { Button } from "../ui/button"
import { Dialog, DialogContent } from "../ui/dialog"
import { LoginForm } from "./LoginForm"
import { useState } from "react"

export function Header() {
  const [showLoginForm, setShowLoginForm] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="text-xl font-bold text-primary">Pedagoia</div>
          <Button 
            variant="ghost"
            onClick={() => setShowLoginForm(true)}
            className="text-primary hover:text-primary/90"
          >
            Se connecter
          </Button>
        </div>
      </div>

      <Dialog open={showLoginForm} onOpenChange={setShowLoginForm}>
        <DialogContent className="sm:max-w-[425px]">
          <LoginForm defaultView="sign_in" />
        </DialogContent>
      </Dialog>
    </header>
  )
}