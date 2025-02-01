import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@supabase/auth-ui-react"

export const Header = () => {
  const auth = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/lovable-uploads/a514063e-400f-4c84-b2f2-78114e277365.png" alt="PedagoIA Logo" className="h-8" />
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
            Contact
          </Link>
          {auth?.user ? (
            <Button asChild>
              <Link to="/chat">Accéder à l'app</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}