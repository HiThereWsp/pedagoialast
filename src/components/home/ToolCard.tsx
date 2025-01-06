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
      className={`group cursor-pointer animate-fade-in h-[280px] hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:scale-[1.02]`}
      onClick={onClick}
    >
      <div className={`p-4 ${bgColor} border-b-2 ${borderColor} h-full flex flex-col`}>
        <div className={`p-2.5 rounded-xl ${color} bg-white/90 backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300 w-fit mb-4 shadow-md`}>
          <Icon className={`w-6 h-6 text-current`} />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-coral-400 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-700">
              {description}
            </p>
          </div>
          <ArrowRight className={`w-5 h-5 ${color} opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300 self-end mt-4`} />
        </div>
      </div>
    </Card>
  )
}