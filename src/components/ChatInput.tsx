import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: Array<{url: string, fileName: string, fileType: string, filePath: string}>) => Promise<void>
  isLoading?: boolean
  value?: string
  onChange?: (value: string) => void
  conversationId?: string
}

export const ChatInput = ({
  onSendMessage,
  isLoading = false,
  value,
  onChange,
  conversationId,
}: ChatInputProps) => {
  const [message, setMessage] = useState(value || "")
  const [attachments, setAttachments] = useState<Array<{url: string, fileName: string, fileType: string, filePath: string}>>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (message.trim() === "" && attachments.length === 0) return
    
    try {
      await onSendMessage(message, attachments)
      setMessage("")
      setAttachments([])
      if (onChange) {
        onChange("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message",
      })
    }
  }

  const handleChange = (value: string) => {
    setMessage(value)
    if (onChange) {
      onChange(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !conversationId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un fichier et vous assurer qu'une conversation est active",
      })
      return
    }

    const file = e.target.files[0]
    
    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le fichier est trop volumineux. Taille maximum : 10MB",
      })
      return
    }

    setIsUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop()
      const filePath = `${conversationId}/${crypto.randomUUID()}.${fileExt}`

      // Upload du fichier
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

      // Ajouter le fichier à la liste des pièces jointes
      setAttachments(prev => [...prev, {
        url: publicUrl,
        fileName: file.name,
        fileType: file.type,
        filePath: filePath
      }])

      toast({
        title: "Succès",
        description: "Le fichier a été uploadé avec succès",
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'uploader le fichier",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100/20">
      <div className="max-w-[800px] mx-auto">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-1 bg-white/50 px-2 py-1 rounded-lg text-sm">
                <span className="truncate max-w-[200px]">{file.fileName}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-4 bg-gradient-to-r from-[#FFDEE2]/20 to-[#FEF7CD]/20 p-4 rounded-2xl border border-[#FFDEE2]/30 shadow-premium hover:shadow-premium-lg transition-all duration-300">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading}
            size="icon"
            variant="ghost"
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre message ici..."
            className="min-h-[60px] max-h-[200px] resize-none flex-1 bg-white/50 border-none focus-visible:ring-0 shadow-inner"
            disabled={isLoading || isUploading}
          />
          <Button 
            onClick={handleSubmit}
            disabled={message.trim() === "" || isLoading || isUploading}
            size="icon"
            className="shrink-0 bg-[#FFDEE2] hover:bg-[#FFDEE2]/80 text-gray-700 shadow-premium hover:shadow-premium-lg transition-all duration-300"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}