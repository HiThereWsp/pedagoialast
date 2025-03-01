
import { toast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, Info } from "lucide-react"

type AlertToastProps = {
  title?: string;
  description: string;
  type?: "success" | "error" | "info";
  duration?: number; // Durée personnalisée optionnelle
}

export function showAlert({ title, description, type = "info", duration }: AlertToastProps) {
  const variant = type === "error" ? "destructive" : type === "success" ? "default" : "default";
  
  // Au lieu d'utiliser la propriété 'icon' directement, nous allons créer
  // un élément JSX pour l'intégrer différemment
  const iconElement = type === "error" 
    ? <AlertCircle className="h-5 w-5 text-red-500" /> 
    : type === "success" 
      ? <CheckCircle className="h-5 w-5 text-green-500" />
      : <Info className="h-5 w-5 text-blue-500" />;
  
  return toast({
    variant,
    title: title || (type === "error" 
      ? "Erreur" 
      : type === "success" 
        ? "Succès" 
        : "Information"),
    description,
    duration,
    // Utilisez className pour intégrer l'icône dans le contenu
    className: "flex gap-3 items-start"
  })
}
