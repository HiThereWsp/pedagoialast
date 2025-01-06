import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

interface ShortcutCardProps {
  title: string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  onClick: () => void
}

export const ShortcutCard = ({
  title,
  description,
  icon: Icon,
  color,
  bgColor,
  onClick
}: ShortcutCardProps) => {
  return (
    <Card
      className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer group animate-fade-in"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${bgColor} transform group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <h3 className="font-medium text-gray-800 group-hover:text-coral-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
      </div>
    </Card>
  )
}