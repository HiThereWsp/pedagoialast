import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Sparkles, Pencil, Image, Box, Smile } from 'lucide-react'
import { ImageStyle, StyleOption } from './types'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

const STYLE_OPTIONS: StyleOption[] = [
  { 
    value: 'auto', 
    label: 'Auto', 
    description: "L'IA choisit automatiquement le style le plus adapté au contexte pédagogique",
    icon: Sparkles 
  },
  { 
    value: 'sketch', 
    label: 'Croquis', 
    description: "Un rendu en dessin au crayon ou en esquisse, idéal pour les schémas et explications",
    icon: Pencil 
  },
  { 
    value: 'realistic', 
    label: 'Réaliste', 
    description: "Un rendu photoréaliste pour des représentations fidèles à la réalité",
    icon: Image 
  },
  { 
    value: '3d', 
    label: '3D', 
    description: "Un rendu en trois dimensions pour visualiser des concepts complexes",
    icon: Box 
  },
  { 
    value: 'anime', 
    label: 'Anime', 
    description: "Un style inspiré de l\"animation japonaise pour un aspect plus engageant",
    icon: Smile 
  }
]

interface ImageStyleSelectorProps {
  selectedStyle: ImageStyle
  onStyleChange: (style: ImageStyle) => void
}

export const ImageStyleSelector = ({ selectedStyle, onStyleChange }: ImageStyleSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Style de l'image</Label>
      <RadioGroup
        value={selectedStyle}
        onValueChange={(value) => onStyleChange(value as ImageStyle)}
        className="flex flex-wrap gap-2"
      >
        {STYLE_OPTIONS.map(({ value, label, icon: Icon, description }) => (
          <div key={value} className="relative">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div>
                  <RadioGroupItem
                    value={value}
                    id={value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={value}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border-2 cursor-pointer
                      transition-colors hover:bg-accent
                      peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary
                      peer-data-[state=checked]:bg-primary/5"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Label>
                </div>
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