import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

interface TextTabContentProps {
  sourceText: string
  setSourceText: (value: string) => void
  classLevel: string
  setClassLevel: (value: string) => void
  additionalInstructions: string
  setAdditionalInstructions: (value: string) => void
}

export const TextTabContent = ({
  sourceText,
  setSourceText,
  classLevel,
  setClassLevel,
  additionalInstructions,
  setAdditionalInstructions,
}: TextTabContentProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium mb-2 block">Votre texte</label>
        <Textarea
          placeholder="Collez votre texte ici..."
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          className="min-h-[200px]"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Niveau de la classe</label>
        <Input
          placeholder="Par exemple : 6ème, CM2, CE1"
          value={classLevel}
          onChange={(e) => setClassLevel(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          Instructions supplémentaires (facultatif)
        </label>
        <Textarea
          placeholder="Précisez toutes les exigences supplémentaires pour votre plan de cours"
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
        />
      </div>
    </>
  )
}