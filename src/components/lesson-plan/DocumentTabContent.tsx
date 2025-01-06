import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Upload } from "lucide-react"

interface DocumentTabContentProps {
  selectedFile: File | null
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  classLevel: string
  setClassLevel: (value: string) => void
  additionalInstructions: string
  setAdditionalInstructions: (value: string) => void
}

export const DocumentTabContent = ({
  selectedFile,
  handleFileChange,
  classLevel,
  setClassLevel,
  additionalInstructions,
  setAdditionalInstructions,
}: DocumentTabContentProps) => {
  return (
    <>
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <span className="text-sm text-gray-600">
            {selectedFile ? selectedFile.name : "Cliquez pour joindre un document"}
          </span>
          <span className="text-xs text-gray-400">
            Formats acceptés : PDF, DOC, DOCX
          </span>
        </label>
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