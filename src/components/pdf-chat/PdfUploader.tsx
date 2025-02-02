import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { FileText, Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

export function PdfUploader() {
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== 'application/pdf') {
        toast({
          variant: "destructive",
          title: "Format invalide",
          description: "Veuillez sélectionner un fichier PDF"
        })
        return
      }
      setFile(selectedFile)
      // Set default title from filename without extension
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
    }
  }

  const processPdf = async (documentId: string) => {
    setIsProcessing(true)
    try {
      const { error } = await supabase.functions.invoke('process-pdf', {
        body: { documentId }
      })

      if (error) throw error

      toast({
        title: "Succès",
        description: "Document traité avec succès"
      })
    } catch (error) {
      console.error('Processing error:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors du traitement du document"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un fichier"
      })
      return
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const filePath = `${crypto.randomUUID()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('lesson-documents')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Save document metadata to database
      const { data: document, error: dbError } = await supabase
        .from('pdf_documents')
        .insert({
          title,
          file_path: filePath,
          user_id: user.id
        })
        .select()
        .single()

      if (dbError) throw dbError

      toast({
        title: "Succès",
        description: "Document téléchargé avec succès"
      })

      // Process the PDF
      if (document) {
        await processPdf(document.id)
      }

      // Reset form
      setFile(null)
      setTitle('')
      
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Erreur lors du téléchargement"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Titre du document</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mon document"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Fichier PDF</Label>
          <div className="flex items-center gap-4">
            <Input
              id="file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                {file.name}
              </div>
            )}
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || isProcessing || !file} 
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Téléchargement...
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            'Télécharger le document'
          )}
        </Button>
      </form>
    </Card>
  )
}