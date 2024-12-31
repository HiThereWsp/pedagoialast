import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const NotFound = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <img 
            src="/favicon.svg" 
            alt="PedagoIA Logo" 
            className="w-20 h-20 mx-auto animate-bounce"
          />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page introuvable
          </h2>
          <p className="text-muted-foreground">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Retourner à l'accueil
          </Button>
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="w-full"
          >
            Revenir en arrière
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound