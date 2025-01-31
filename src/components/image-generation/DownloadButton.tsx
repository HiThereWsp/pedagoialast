import { Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface DownloadButtonProps {
  imageUrl: string
}

export const DownloadButton = ({ imageUrl }: DownloadButtonProps) => {
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      // First try to download directly
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error('Failed to fetch image')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'generated-image.png'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        description: "Image téléchargée avec succès",
      })
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err)
      // If direct download fails, try through edge function
      try {
        const { data, error } = await supabase.functions.invoke('download-image', {
          body: { imageUrl }
        })
        
        if (error) throw error
        
        const base64Data = data.imageBase64
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'image/png' })
        
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'generated-image.png'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast({
          description: "Image téléchargée avec succès",
        })
      } catch (err) {
        console.error('Erreur lors du téléchargement via edge function:', err)
        toast({
          variant: "destructive",
          description: "Erreur lors du téléchargement de l'image",
        })
      }
    }
  }

  return (
    <button
      onClick={handleDownload}
      className="rounded-full p-2 text-gray-400 hover:bg-[#E5DEFF] hover:text-[#6E59A5] transition-all duration-300 transform hover:scale-110"
      aria-label="Télécharger l'image"
    >
      <Download className="h-5 w-5" />
    </button>
  )
}