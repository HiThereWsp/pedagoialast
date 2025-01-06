import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

interface SubjectTabContentProps {
  subject: string
  setSubject: (value: string) => void
  classLevel: string
  setClassLevel: (value: string) => void
  additionalInstructions: string
  setAdditionalInstructions: (value: string) => void
}

export const SubjectTabContent = ({
  subject,
  setSubject,
  classLevel,
  setClassLevel,
  additionalInstructions,
  setAdditionalInstructions,
}: SubjectTabContentProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium mb-2 block">Votre sujet</label>
        <Input
          placeholder="Entrez un sujet. Par exemple : Système solaire, Photosynthèse"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
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