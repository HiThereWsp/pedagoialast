import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Upload } from 'lucide-react'
import { PdfChat } from "./PdfChat"
import { Box, Center, Flex, Icon, Text, VStack } from "@chakra-ui/react"

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

      // Upload file to storage
      const fileName = `${crypto.randomUUID()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('lesson-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get file URL
      const { data: { publicUrl } } = supabase.storage
        .from('lesson-documents')
        .getPublicUrl(fileName)

      // Save document metadata
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

      // Process the document
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
    <Center h="calc(100vh - 200px)">
      <Box 
        maxW="xl" 
        w="full" 
        p={8} 
        borderRadius="xl" 
        bg="white" 
        shadow="xl"
        border="2px"
        borderColor="gray.100"
        borderStyle="dashed"
      >
        <form onSubmit={handleUpload}>
          <VStack spacing={6}>
            <Icon as={Upload} boxSize={12} color="gray.400" />
            
            <VStack spacing={2}>
              <Text fontSize="xl" fontWeight="semibold">
                Upload a PDF to Start
              </Text>
              <Text color="gray.500">
                Drag & drop a PDF here, or click to select
              </Text>
            </VStack>

            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              style={{ display: 'none' }}
              id="file-upload"
            />
            
            <Label 
              htmlFor="file-upload"
              className="cursor-pointer hover:bg-gray-50 w-full text-center py-3 border rounded-lg"
            >
              Choose a file
            </Label>

            {file && (
              <VStack spacing={4} w="full">
                <Box w="full">
                  <Label htmlFor="title">Titre du document</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUploading}
                  />
                </Box>

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
              </VStack>
            )}
          </VStack>
        </form>
      </Box>
    </Center>
  )
}