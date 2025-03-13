
import { Settings, LogOut, MessageSquare, Mail } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export const UserMenu = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      // Vérifier d'abord si une session existe
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("Session error:", sessionError)
        // En cas d'erreur de session, on nettoie quand même
        localStorage.clear()
        navigate('/waiting-list')
        return
      }

      if (!session) {
        console.log("No session found, redirecting to waiting-list")
        navigate('/waiting-list')
        return
      }

      // Si on a une session valide, on tente la déconnexion
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Signout error:", error)
        toast({
          variant: "destructive",
          title: "Erreur de déconnexion",
          description: "Une erreur est survenue lors de la déconnexion. Veuillez réessayer.",
        })
      } else {
        console.log("Successfully signed out")
        localStorage.clear() // Nettoyer le localStorage
        navigate('/waiting-list')
      }
    } catch (error) {
      console.error("Unexpected error during signout:", error)
      localStorage.clear() // Par sécurité, on nettoie quand même
      navigate('/waiting-list')
    }
  }

  return (
    <div className="w-full flex justify-end mb-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
            <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24">
              <path 
                fill="currentColor" 
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigate('/suggestions')} className="cursor-pointer">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Suggérer des fonctionnalités</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
            <Mail className="mr-2 h-4 w-4" />
            <span>Nous contacter</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
