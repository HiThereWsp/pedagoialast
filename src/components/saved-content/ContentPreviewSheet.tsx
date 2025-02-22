
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Copy, Trash2 } from "lucide-react"
import { ScrollCard } from "@/components/exercise/result/ScrollCard"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SavedContent } from "@/types/saved-content"

interface ContentPreviewSheetProps {
  content: SavedContent | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (content: SavedContent) => void
}

export const ContentPreviewSheet = ({
  content,
  isOpen,
  onOpenChange,
  onDelete
}: ContentPreviewSheetProps) => {
  const [activeTab, setActiveTab] = useState('student')
  const { toast } = useToast()

  if (!content) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.content)
      toast({
        description: "Contenu copié dans le presse-papier",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Erreur lors de la copie du contenu",
      })
    }
  }

  const renderContent = () => {
    switch (content.type) {
      case 'Image':
        return (
          <div className="mt-6">
            <img 
              src={content.content} 
              alt={content.title} 
              className="w-full rounded-lg object-contain max-h-[80vh]"
            />
          </div>
        )
      case 'exercise':
        return (
          <>
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Fiche Élève</TabsTrigger>
                <TabsTrigger value="correction">Correction</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="mt-6">
              <ScrollCard 
                exercises={content.content} 
                showCorrection={activeTab === 'correction'}
                customClass="text-sm"
                hideActions={true}
                disableInternalTabs={true}
              />
            </div>
          </>
        )
      case 'lesson-plan':
      case 'correspondence':
        return (
          <div className="mt-6">
            <ScrollCard 
              exercises={content.content} 
              showCorrection={false}
              customClass="text-sm"
              hideActions={true}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-xl font-bold">
            {content.title}
          </SheetTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(content)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {renderContent()}
      </SheetContent>
    </Sheet>
  )
}
