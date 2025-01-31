import { Loader2 } from "lucide-react"

export const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Génération en cours...
        </p>
        <p className="text-xs text-muted-foreground/80">
          Cela peut prendre jusqu'à 30 secondes
        </p>
      </div>
    </div>
  )
}