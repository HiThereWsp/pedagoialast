
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

interface BackButtonProps {
  fallbackPath?: string;
}

export const BackButton = ({ fallbackPath = "/tableaudebord" }: BackButtonProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const handleBack = () => {
    // Check if we have a history to go back to
    if (window.history.length > 2) {
      navigate(-1)
      return
    }
    
    // If no history, use these specific routes
    if (location.pathname === '/privacy' || location.pathname === '/terms') {
      navigate('/legal')
    } else if (location.pathname === '/legal') {
      navigate('/tableaudebord')
    } else if (location.pathname === '/suggestions') {
      navigate('/tableaudebord')
    } else {
      // Default fallback
      navigate(fallbackPath)
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
