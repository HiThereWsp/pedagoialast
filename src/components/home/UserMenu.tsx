
import { Settings, LogOut, HelpCircle, Mail } from "lucide-react"
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
        navigate('/bienvenue')
        return
      }

      if (!session) {
        console.log("No session found, redirecting to bienvenue")
        navigate('/bienvenue')
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
        navigate('/bienvenue')
      }
    } catch (error) {
      console.error("Unexpected error during signout:", error)
      localStorage.clear() // Par sécurité, on nettoie quand même
      navigate('/bienvenue')
    }
  }

  return (
    <div className="w-full flex justify-end mb-8">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 py-1 px-3 rounded-md hover:bg-gray-100 transition-colors">
          <span className="font-medium">Andy</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
            <Mail className="mr-2 h-4 w-4" />
            <span>Nous contacter</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/contact')} className="cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Aide</span>
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
