
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { ScrollCard } from "@/components/exercise/result/ScrollCard"
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
  if (!content) return null

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-xl font-bold">
            {content.title}
          </SheetTitle>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(content)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="mt-6">
          {content.type === 'Image' ? (
            <img 
              src={content.content} 
              alt={content.title} 
              className="w-full rounded-lg"
            />
          ) : (
            <ScrollCard 
              exercises={content.content} 
              showCorrection={true}
              customClass="text-sm"
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
