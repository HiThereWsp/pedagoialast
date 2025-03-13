
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { AlertTriangle } from "lucide-react"

const NotFound = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1)
    } else {
      navigate('/bienvenue')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <img 
              src="/favicon.svg" 
              alt="PedagoIA Logo" 
              className="w-24 h-24 mx-auto"
            />
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-balance">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page introuvable
          </h2>
          <p className="text-muted-foreground">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="flex justify-center text-amber-500">
            <AlertTriangle size={48} />
          </div>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => navigate('/bienvenue')}
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
