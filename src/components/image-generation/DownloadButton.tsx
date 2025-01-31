import { Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DownloadButtonProps {
  imageUrl: string
}

export const DownloadButton = ({ imageUrl }: DownloadButtonProps) => {
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      console.log('Starting direct download for:', imageUrl)
      
      // Create a temporary link element
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = 'generated-image.png' // Set the filename
      link.target = '_blank' // Open in new tab if download fails
      
      // Trigger the download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        description: "Image téléchargée avec succès",
      })
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err)
      toast({
        variant: "destructive",
        description: "Erreur lors du téléchargement de l'image",
      })
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