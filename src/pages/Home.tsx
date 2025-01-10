import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"
import { 
  Compass, 
  BookOpen, 
  SplitSquareVertical, 
  PenSquare, 
  FileText, 
  MessageSquare,
  Settings,
  LogOut
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HomeSkeleton } from "@/components/home/HomeSkeleton"

const Home = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [firstName, setFirstName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user)
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setFirstName(profile.first_name)
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const actions = [
    {
      title: "Découvrir l'application",
      route: "/discover",
      icon: Compass,
      isUtilityAction: true
    },
    {
      title: "Chatter avec l'assistant",
      route: "/chat",
      icon: MessageSquare,
      isUtilityAction: false
    },
    {
      title: "Générer une séquence pédagogique",
      route: "/lesson-plan",
      icon: BookOpen
    },
    {
      title: "Adapter un exercice",
      route: "/differenciation",
      icon: SplitSquareVertical
    },
    {
      title: "Générer un exercice",
      route: "/exercises",
      icon: PenSquare
    },
    {
      title: "Rédiger un document administratif",
      route: "/correspondence",
      icon: FileText
    }
  ]

  // Séparer les actions en deux groupes
  const utilityActions = actions.filter(action => action.isUtilityAction)
  const mainActions = actions.filter(action => !action.isUtilityAction)

  if (isLoading) {
    return <HomeSkeleton />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-8 max-w-md mx-auto">
      {/* Profile dropdown */}
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
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Welcome message */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          Bonjour {firstName} 
          <span role="img" aria-label="wave">👋</span>
        </h1>
        <p className="text-xl text-gray-600">
          Sur quoi souhaitez-vous travailler aujourd'hui ?
        </p>
      </div>

      {/* Action buttons */}
      <div className="w-full space-y-6">
        {/* Utility action at the top */}
        {utilityActions.slice(0, 1).map((action, index) => {
          const Icon = action.icon
          return (
            <Button
              key={index}
              onClick={() => navigate(action.route)}
              className="w-full h-12 bg-gradient-to-r from-blue-100/60 to-blue-200/60 hover:from-blue-100/80 hover:to-blue-200/80 text-gray-800 rounded-2xl border border-blue-200/50 shadow-sm transition-all duration-300 hover:shadow-md"
              variant="ghost"
            >
              <Icon className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600" />
              <span className="flex-1 text-left">{action.title}</span>
            </Button>
          )}
        )}

        {/* Main actions */}
        <div className="space-y-4">
          {mainActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                onClick={() => navigate(action.route)}
                className="w-full h-14 bg-gradient-to-r from-[#FEF7CD]/60 to-[#FFDEE2]/60 hover:from-[#FEF7CD]/80 hover:to-[#FFDEE2]/80 text-gray-800 rounded-2xl border border-[#FEF7CD]/50 shadow-sm transition-all duration-300 hover:shadow-md"
                variant="ghost"
              >
                <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="flex-1 text-left">{action.title}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Footer with logo */}
      <div className="mt-12 flex items-center gap-2">
        <img src="/favicon.svg" alt="PedagoIA Logo" className="w-8 h-8" />
        <p className="text-2xl font-semibold text-gray-800">PedagoIA</p>
      </div>
    </div>
  )
}

export default Home