
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

export const BackButton = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleBack = () => {
    // Si on est sur une page spécifique, définir un comportement personnalisé
    if (location.pathname === '/privacy' || location.pathname === '/terms') {
      navigate('/legal')
    } else if (location.pathname === '/legal') {
      navigate('/tableaudebord')
    } else if (location.pathname === '/suggestions') {
      navigate('/tableaudebord')
    } else {
      navigate('/tableaudebord')
    }
  }
  
  return (
    <Button 
      variant="ghost" 
      className="mb-4"
      onClick={handleBack}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      Retour
    </Button>
  )
}
