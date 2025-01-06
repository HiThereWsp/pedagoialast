import { useState } from 'react'
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"

export function CurriculumUploader() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    gradeLevel: '',
    academicYear: '',
    file: null as File | null
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      if (!formData.file) {
        throw new Error('Please select a file')
      }

      const formDataToSend = new FormData()
      formDataToSend.append('file', formData.file)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('subject', formData.subject)
      formDataToSend.append('gradeLevel', formData.gradeLevel)
      formDataToSend.append('academicYear', formData.academicYear)
      formDataToSend.append('userId', user.id)

      const { data, error } = await supabase.functions.invoke('upload-curriculum', {
        body: formDataToSend
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        gradeLevel: '',
        academicYear: '',
        file: null
      })

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload document",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titre du document</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Matière</Label>
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gradeLevel">Niveau</Label>
          <Input
            id="gradeLevel"
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="academicYear">Année scolaire</Label>
          <Input
            id="academicYear"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleInputChange}
            placeholder="2023-2024"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Document PDF</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Upload en cours...
          </>
        ) : (
          'Uploader le document'
        )}
      </Button>
    </form>
  )
}