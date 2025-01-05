import { Loader2 } from "lucide-react"

export const LoadingIndicator = () => {
  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-4 mr-auto max-w-[80%] flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <p className="text-muted-foreground">En train d'écrire...</p>
    </div>
  )
}