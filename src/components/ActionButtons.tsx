
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { actions } from "@/data/actions"

export const ActionButtons = () => {
  const navigate = useNavigate()
  
  const mainActions = actions.filter(action => !action.isUtilityAction)

  return (
    <div className="w-full space-y-4">
      {mainActions.map((action, index) => {
        const Icon = action.icon
        return (
          <Button
            key={index}
            onClick={() => navigate(action.route)}
            className="w-full h-14 bg-gradient-to-r from-[#FEF7CD]/60 to-[#FFDEE2]/60 hover:from-[#FEF7CD]/80 hover:to-[#FFDEE2]/80 text-gray-800 rounded-2xl border border-[#FEF7CD]/50 shadow-sm transition-all duration-300 hover:shadow-md relative"
            variant="ghost"
            disabled={!!action.maintenanceLabel}
          >
            <div className="flex items-center w-full">
              <div className="flex-shrink-0 w-7 h-7 mr-3 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <span className="flex-1 text-left">{action.title}</span>
              {action.isNew && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  Nouveau
                </span>
              )}
              {action.maintenanceLabel && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                  {action.maintenanceLabel}
                </span>
              )}
            </div>
          </Button>
        )
      })}
    </div>
  )
}
