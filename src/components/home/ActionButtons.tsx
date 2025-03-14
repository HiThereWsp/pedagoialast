
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
              onClick={() => !action.maintenanceLabel && navigate(action.route)}
              className="w-full h-14 bg-gradient-to-r from-[#FEF7CD]/60 to-[#FFDEE2]/60 hover:from-[#FEF7CD]/80 hover:to-[#FFDEE2]/80 text-gray-800 rounded-2xl border border-[#FEF7CD]/50 shadow-sm transition-all duration-300 hover:shadow-md relative disabled:opacity-60 disabled:cursor-not-allowed"
              variant="ghost"
              disabled={!!action.maintenanceLabel}
            >
              <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
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
            </Button>
          )
        })}
      </div>
    </div>
  )
}
