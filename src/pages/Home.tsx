import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"

const Home = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [firstName, setFirstName] = useState<string>("")

  useEffect(() => {
    const getUser = async () => {
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
    }
    getUser()
  }, [])

  const actions = [
    {
      title: "Découvrir l'application",
      route: "/discover"
    },
    {
      title: "Générer une séquence pédagogique",
      route: "/lesson-plan"
    },
    {
      title: "Différencier un exercices",
      route: "/differenciation"
    },
    {
      title: "Générer un exercice",
      route: "/exercises"
    },
    {
      title: "Rédiger un document administratif",
      route: "/correspondence"
    },
    {
      title: "Suggérer de nouveaux outils pédagogiques",
      route: "/suggestions"
    }
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6 py-8 max-w-md mx-auto">
      {/* Profile icon */}
      <div className="w-full flex justify-end mb-8">
        <div 
          className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
          onClick={() => navigate('/settings')}
        >
          <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24">
            <path 
              fill="currentColor" 
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </div>
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
      <div className="w-full space-y-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={() => navigate(action.route)}
            className="w-full h-14 bg-gradient-to-r from-[#FEF7CD]/30 to-[#FFDEE2]/30 hover:from-[#FEF7CD]/40 hover:to-[#FFDEE2]/40 text-gray-800 rounded-2xl border border-[#FEF7CD]/30 shadow-sm transition-all duration-300 hover:shadow-md"
            variant="ghost"
          >
            {action.title}
          </Button>
        ))}
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