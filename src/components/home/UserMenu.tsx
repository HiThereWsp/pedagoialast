import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, User, CreditCard } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useSubscription } from "@/hooks/useSubscription"

export function UserMenu() {
  const { user } = useAuth()
  const { isSubscriptionActive, getSubscriptionType } = useSubscription()
  const navigate = useNavigate()
  const [openMenu, setOpenMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Une erreur est survenue lors de la déconnexion")
    }
  }

  const getInitials = () => {
    if (!user) return "U"
    
    // Si l'utilisateur a un email, utiliser la première lettre
    if (user.email) {
      return user.email.charAt(0).toUpperCase()
    }
    
    // Fallback
    return "U"
  }

  return (
    <DropdownMenu open={openMenu} onOpenChange={setOpenMenu}>
      <DropdownMenuTrigger asChild className="overflow-hidden">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">
              {user?.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              Abonnement: {getSubscriptionType()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Ajouter un lien vers la page d'abonnement */}
        <DropdownMenuItem onSelect={() => navigate("/subscription")}>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Mon abonnement</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onSelect={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
