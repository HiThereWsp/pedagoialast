
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { actions } from "@/data/actions"
import { ArrowRight } from "lucide-react"

export const ActionButtons = () => {
  const navigate = useNavigate()
  
  const mainActions = actions.filter(action => !action.isUtilityAction)

  return (
    <div className="w-full space-y-5 max-w-md mx-auto">
      <div className="space-y-4">
        {mainActions.map((action, index) => {
          const Icon = action.icon
          return (
            <Button
              key={index}
              onClick={() => navigate(action.route)}
              className="w-full h-16 bg-gradient-to-r from-[#FEF7CD]/60 to-[#FFDEE2]/60 hover:from-[#FEF7CD]/80 hover:to-[#FFDEE2]/80 text-gray-800 rounded-2xl border border-[#FEF7CD]/50 shadow-sm transition-all duration-300 hover:shadow-md group"
              variant="ghost"
            >
              <div className="flex items-center justify-between w-full px-1">
                <div className="flex items-center">
                  <div className="bg-white/70 p-2 rounded-lg mr-4">
                    <Icon className="w-5 h-5 flex-shrink-0 text-gray-700" />
                  </div>
                  <span className="text-left font-medium">{action.title}</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
