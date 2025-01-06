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
      className="group cursor-pointer animate-fade-in h-[280px] hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 hover:scale-[1.02] card-gradient-headspace"
      onClick={onClick}
    >
      <div className={`p-6 h-full flex flex-col relative overflow-hidden ${bgColor}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent" />
        <div className="relative z-10">
          <div className={`p-3 rounded-2xl bg-white/90 backdrop-blur-sm w-fit mb-4 shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-headspace-orange transition-colors">
                {title}
              </h3>
              <p className="text-gray-600">
                {description}
              </p>
            </div>
            <ArrowRight className={`w-5 h-5 ${color} opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-300 self-end mt-4`} />
          </div>
        </div>
      </div>
    </Card>
  )
}