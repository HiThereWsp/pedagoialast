import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Upload } from 'lucide-react'
import { PdfChat } from "./PdfChat"

export const PdfUploader = () => {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setTitle(selectedFile.name.replace('.pdf', ''))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || isUploading) return

    try {
      setIsUploading(true)
      const user = await supabase.auth.getUser()
      
      if (!user.data.user) {
        throw new Error("User not authenticated")
      }

      const fileName = `${crypto.randomUUID()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('lesson-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: doc, error: dbError } = await supabase
        .from('pdf_documents')
        .insert({
          title,
          file_path: fileName,
          user_id: user.data.user.id
        })
        .select()
        .single()

      if (dbError) throw dbError

      const { error: processError } = await supabase.functions
        .invoke('process-pdf', {
          body: { documentId: doc.id }
        })

      if (processError) throw processError

      setUploadedDocId(doc.id)
      
      toast({
        title: "Document téléchargé avec succès",
        description: "Vous pouvez maintenant discuter avec le contenu du document."
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement du document."
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (uploadedDocId) {
    return <PdfChat documentId={uploadedDocId} title={title} />
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="max-w-xl w-full p-8 rounded-xl bg-white shadow-xl border-2 border-dashed border-gray-100">
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="flex flex-col items-center gap-6">
            <Upload className="w-12 h-12 text-gray-400" />
            
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">
                Upload a PDF to Start
              </h3>
              <p className="text-gray-500">
                Drag & drop a PDF here, or click to select
              </p>
            </div>

            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            
            <Label 
              htmlFor="file-upload"
              className="cursor-pointer hover:bg-gray-50 w-full text-center py-3 border rounded-lg"
            >
              Choose a file
            </Label>

            {file && (
              <div className="w-full space-y-4">
                <div className="w-full">
                  <Label htmlFor="title">Titre du document</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!file || !title || isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Télécharger
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}