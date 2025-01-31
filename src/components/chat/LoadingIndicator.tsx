import { Loader2 } from "lucide-react"

export const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        Génération en cours...
      </p>
    </div>
  )
}