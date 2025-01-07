import { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface ToolCardProps {
  title: string
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
  onClick: () => void
}

export const ToolCard = ({
  title,
  description,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  onClick
}: ToolCardProps) => {
  return (
    <Card 
      className="group cursor-pointer premium-card h-full min-h-[280px] overflow-hidden"
      onClick={onClick}
    >
      <div className={`p-6 sm:p-8 ${bgColor} h-full flex flex-col relative overflow-hidden`}>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50" />
        
        {/* Icon container with premium styling */}
        <div className={`relative p-3 rounded-2xl ${color} bg-white/90 backdrop-blur-sm transform group-hover:scale-110 transition-all duration-300 w-fit mb-6 shadow-premium hover:shadow-premium-lg`}>
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 text-current`} />
        </div>

        {/* Content container */}
        <div className="flex-1 flex flex-col justify-between relative z-10">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 group-hover:premium-text transition-all duration-300">
              {title}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Arrow with premium animation */}
          <div className="flex justify-end mt-6">
            <ArrowRight className={`w-5 h-5 ${color} opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300`} />
          </div>
        </div>

        {/* Premium shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Card>
  )
}