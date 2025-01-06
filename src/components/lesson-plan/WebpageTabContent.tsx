import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"

interface WebpageTabContentProps {
  webSubject: string
  setWebSubject: (value: string) => void
  webUrl: string
  setWebUrl: (value: string) => void
  classLevel: string
  setClassLevel: (value: string) => void
  additionalInstructions: string
  setAdditionalInstructions: (value: string) => void
}

export const WebpageTabContent = ({
  webSubject,
  setWebSubject,
  webUrl,
  setWebUrl,
  classLevel,
  setClassLevel,
  additionalInstructions,
  setAdditionalInstructions,
}: WebpageTabContentProps) => {
  return (
    <>
      <div>
        <label className="text-sm font-medium mb-2 block">Sujet</label>
        <Input
          placeholder="Entrez le sujet de la page web"
          value={webSubject}
          onChange={(e) => setWebSubject(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Lien de la page web</label>
        <Input
          placeholder="Collez l'URL de la page web"
          value={webUrl}
          onChange={(e) => setWebUrl(e.target.value)}
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