import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Sparkles, Palette, Image, Box, Smile } from 'lucide-react'
import { ImageStyle } from './types'

const STYLE_OPTIONS = [
  { value: 'auto', label: 'Auto', icon: Sparkles },
  { value: 'general', label: 'Général', icon: Palette },
  { value: 'realistic', label: 'Réaliste', icon: Image },
  { value: '3d', label: '3D', icon: Box },
  { value: 'anime', label: 'Anime', icon: Smile },
] as const

interface ImageStyleSelectorProps {
  selectedStyle: ImageStyle
  onStyleChange: (style: ImageStyle) => void
}

export const ImageStyleSelector = ({ selectedStyle, onStyleChange }: ImageStyleSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Style de l'image</Label>
      <RadioGroup
        value={selectedStyle}
        onValueChange={(value) => onStyleChange(value as ImageStyle)}
        className="flex flex-wrap gap-2"
      >
        {STYLE_OPTIONS.map(({ value, label, icon: Icon }) => (
          <div key={value} className="relative">
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
        ))}
      </RadioGroup>
    </div>
  )
}