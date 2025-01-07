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
      className="premium-card p-5 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center space-x-4 relative">
        {/* Icon container with premium styling */}
        <div className={`p-2.5 rounded-xl ${bgColor} transform group-hover:scale-110 transition-all duration-300 shadow-premium hover:shadow-premium-lg relative`}>
          <Icon className={`w-5 h-5 ${color}`} />
          {/* Premium shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-gray-800 group-hover:premium-text transition-all duration-300 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  )
}