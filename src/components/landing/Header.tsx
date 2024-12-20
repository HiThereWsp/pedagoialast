import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="text-xl font-bold text-primary">Pedagoia</div>
          <Button 
            variant="ghost"
            onClick={() => navigate('/login?view=sign_in')}
            className="text-primary hover:text-primary/90"
          >
            Se connecter
          </Button>
        </div>
      </div>
    </header>
  )
}