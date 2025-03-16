import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { actions } from "@/data/actions"

export const ActionButtons = () => {
  const navigate = useNavigate()
  
  const mainActions = actions.filter(action => !action.isUtilityAction)

  return (
    <div className="w-full space-y-6">
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
  )
}