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
      className={`
        group cursor-pointer animate-fade-in h-[360px] 
        hover:shadow-2xl transition-all duration-500 overflow-hidden 
        transform-gpu hover:-translate-y-2 hover:scale-[1.02]
        relative before:absolute before:inset-0 before:bg-gradient-to-br 
        before:from-white/10 before:to-transparent before:opacity-0 
        before:transition-opacity before:duration-500 hover:before:opacity-100
        after:absolute after:inset-0 after:bg-gradient-to-tr 
        after:from-transparent after:to-white/5 after:opacity-0 
        after:transition-opacity after:duration-500 hover:after:opacity-100
      `}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className={`p-6 ${bgColor} border-b-2 ${borderColor} h-full flex flex-col relative z-10`}>
        <div 
          className={`
            p-3 rounded-2xl bg-white/80 backdrop-blur-sm 
            transform-gpu group-hover:scale-110 group-hover:rotate-3
            transition-transform duration-500 w-fit mb-6 shadow-lg
          `}
        >
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <div className="flex-1 flex flex-col justify-between transform-gpu transition-transform duration-500 group-hover:translate-z-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 group-hover:text-coral-400 transition-colors">
              {title}
            </h3>
            <p className="text-gray-600">
              {description}
            </p>
          </div>
          <ArrowRight 
            className={`
              w-5 h-5 ${color} opacity-0 group-hover:opacity-100 
              transform-gpu group-hover:translate-x-2 group-hover:translate-z-12
              transition-all duration-500 self-end mt-6
            `} 
          />
        </div>
      </div>
    </Card>
  )
}