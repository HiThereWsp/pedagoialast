import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

export const BackButton = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleBack = () => {
    // Si on est sur une page légale (privacy ou terms), on retourne à la page legal
    if (location.pathname === '/privacy' || location.pathname === '/terms') {
      navigate('/legal')
    } else {
      navigate('/home')
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