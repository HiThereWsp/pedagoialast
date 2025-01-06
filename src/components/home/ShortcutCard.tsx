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
      className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group animate-fade-in transform hover:-translate-y-1 hover:scale-[1.02] card-gradient-headspace"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${bgColor} transform group-hover:scale-110 transition-transform duration-300 shadow-md relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
          <Icon className={`w-6 h-6 ${color} relative z-10`} />
        </div>
        <div>
          <h3 className="font-medium text-gray-800 group-hover:text-headspace-orange transition-colors text-lg">
            {title}
          </h3>
          <p className="text-gray-600">
            {description}
          </p>
        </div>
      </div>
    </Card>
  )
}