import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ImageStyle } from "./types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Paintbrush, Wand2, Image } from "lucide-react"

interface ImageStyleSelectorProps {
  selectedStyle: ImageStyle
  onStyleChange: (style: ImageStyle) => void
}

const styles: Array<{
  value: ImageStyle
  label: string
  description: string
  Icon: React.ComponentType<{ className?: string }>
}> = [
  {
    value: "auto",
    label: "Auto",
    description: "Laissez PedagoIA choisir le style le plus adapté",
    Icon: Wand2
  },
  {
    value: "realistic",
    label: "Réaliste",
    description: "Un style photoréaliste pour des images authentiques",
    Icon: Paintbrush
  },
  {
    value: "3d",
    label: "3D",
    description: "Un style en trois dimensions",
    Icon: Image
  }
]

export const ImageStyleSelector = ({ selectedStyle, onStyleChange }: ImageStyleSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Style de l'image
      </label>
      <RadioGroup value={selectedStyle} onValueChange={onStyleChange} className="flex flex-wrap gap-2">
        {styles.map(({ value, label, description, Icon }) => (
          <div key={value} className="relative">
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  onClick={() => onStyleChange(value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer
                    transition-all duration-200
                    ${selectedStyle === value 
                      ? 'bg-gradient-to-r from-[#FFD700] via-[#FF69B4] to-[#FF8C00] text-black font-medium shadow-md' 
                      : 'bg-secondary hover:bg-secondary/80'
                    }`}
                >
                  <RadioGroupItem 
                    value={value}
                    className="sr-only"
                  />
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="text-sm text-muted-foreground">{description}</p>
              </HoverCardContent>
            </HoverCard>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}